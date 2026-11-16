# gulucaptain/RoboKata-A-latent-21860

## Resumen

RoboKata-A-latent-21860 es un adaptador LoRA para robótica construido sobre el modelo base Robbyant-Research/zero-wam-pretrain, un modelo de política visomotora orientado a manipulación robótica. Lo publica el usuario gulucaptain en Hugging Face y su propósito es el de servir como experimento de integración entre el paradigma RoboICL (Robotic In-Context Learning) y una rama de acción que lee directamente los tokens de parche del vídeo de demostración mediante tres módulos de cross-attention con compuerta.

La variante A_latent conserva el flujo de matching original entre vídeo y acción, así como el módulo MCP latente, pero desactiva la predicción semántica de futuro (semantic foresight) y el indexado de foresight. El adaptador se entrenó sobre 21.860 pares de entrenamiento exclusivamente con el robot Franka, durante 20 épocas, con rango LoRA 98 y 471.342.625 parámetros entrenables, lo que representa un 0,158% más que la referencia A+B1+FI.

Es relevante porque documenta una receta reproducible de adaptación paramétricamente eficiente sobre un modelo de política robótica, con contratos de datos y configuración explícitos, y porque ejemplifica el patrón de publicación de adaptadores (no modelos completos) en el ecosistema de robótica open source. El checkpoint no incluye mediciones de éxito en bucle cerrado según el propio exportador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de política visomotora (zero-wam-pretrain) con rama de acción y cross-attention con compuerta; detalles completos de la arquitectura base no disponibles |
| Parámetros totales | No disponible (el adaptador declara 471.342.625 parámetros entrenables) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, no orientado a texto) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter.safetensors), con adapter.json y adapter_config.json por época |

## Arquitectura y entrenamiento

El adaptador se construye sobre el checkpoint compartido Zero-WAM pretrain. Su innovación principal es que la rama de acción lee directamente los tokens de parche del vídeo de demostración a través de tres módulos de cross-attention con compuerta, en lugar de depender de un resumen intermedio. Se mantienen el flujo de matching original entre vídeo y acción y el módulo MCP latente, mientras que la predicción semántica de futuro y el indexado de foresight quedan desactivados en esta variante.

El entrenamiento utilizó 21.860 pares exclusivamente del robot Franka, 20 épocas, batch de 16 por GPU, rango LoRA de 98 y 471.342.625 parámetros entrenables (un 0,158% por encima de la referencia A+B1+FI). La receta activa emplea learning rate 1e-4, 100 pasos de warmup, decaimiento coseno hasta 1e-6, semilla 1 y demo dropout de 0,3. Cada carpeta de época contiene los pesos del adaptador, un JSON con paso, contador y SHA-256, y el adapter_config.json que define el contrato de modelo y datos. El estado del optimizador y del generador aleatorio permanece en los checkpoints de entrenamiento originales y no se publica.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales y demostraciones de vídeo, en el contexto de manipulación con brazo Franka.
- Aprendizaje en contexto robótico (RoboICL): la rama de acción consume directamente los tokens de parche del vídeo de demostración mediante cross-attention con compuerta.
- Matching vídeo-acción mediante flow matching, heredado del modelo base.
- Módulo MCP latente para representaciones latentes de la política.
- Integración con caché VAE verificada; no requiere caché DINO según la model card.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en aprendizaje en contexto para robótica: el adaptador permite reproducir y extender la receta RoboICL + A_latent sobre Zero-WAM, comparando el efecto de la rama de acción con cross-attention frente a la referencia A+B1+FI.
- Manipulación con brazo Franka en laboratorio: al haberse entrenado solo con pares Franka, es adecuado para experimentos de imitación y políticas visomotoras en ese robot concreto.
- Evaluación de adaptadores LoRA en políticas robóticas: sirve para estudiar cómo un adaptador de rango 98 y ~471 M de parámetros entrenables modifica el comportamiento de un modelo base congelado.
- Integración de demostraciones por vídeo: el uso de tokens de parche del vídeo como entrada directa de la rama de acción facilita pipelines donde las demostraciones se capturan en vídeo y se reutilizan sin extracción de características adicionales (sin caché DINO).
- Reproducibilidad de experimentos: la publicación por épocas con SHA-256, contador de paso y configuración permite auditar y replicar entrenamientos en entornos de investigación.
- Base para ablaciones sobre foresight: al desactivar semantic foresight e indexado, el adaptador sirve como punto de partida para medir el impacto de esas componentes en tareas posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el exportador del checkpoint no ha medido el éxito en bucle cerrado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador declara 471.342.625 parámetros entrenables, pero el tamaño total del modelo base no se especifica en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; la librería declarada es PyTorch y requiere el código de integración A_latent correspondiente y la revisión del modelo base indicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboKata-A-latent-21860 | 471.342.625 entrenables (adaptador) | No disponible | Sin métricas de éxito en bucle cerrado | No disponible | Hugging Face (gulucaptain) |
| Robbyant-Research/zero-wam-pretrain | No disponible | No disponible | No disponible | No disponible | Hugging Face (modelo base) |
| Referencia A+B1+FI (misma familia) | 471.342.625 / 1,00158 (relación indicada en la model card) | No disponible | No disponible | No disponible | No disponible como checkpoint independiente en la información proporcionada |

No se dispone de datos suficientes para comparar con alternativas externas de la misma categoría.

## Limitaciones y advertencias

- El adaptador no es un modelo base autónomo: requiere cargar la revisión indicada de Robbyant-Research/zero-wam-pretrain junto con el código de integración A_latent.
- No se ha medido el éxito en bucle cerrado; no hay evidencia publicada de rendimiento en tareas reales.
- Entrenado exclusivamente con pares del robot Franka, por lo que la generalización a otras plataformas no está documentada.
- Licencia no disponible: no puede asumirse uso comercial sin confirmación del autor.
- Idiomas no aplicables o no documentados; no es un modelo de texto general.
- Riesgo de sobreajuste a la distribución de las 21.860 demostraciones y al demo dropout de 0,3 usado en entrenamiento.
- El estado del optimizador y del generador aleatorio no se publica, lo que limita la reanudación exacta del entrenamiento.
- La variante desactiva semantic foresight e indexado de foresight, de modo que no debe esperarse el comportamiento de otras variantes de la familia que sí las incluyan.
- No se documentan sesgos, alucinación en el sentido de modelos de lenguaje ni limitaciones de contexto, por no ser aplicables o no estar disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gulucaptain/RoboKata-A-latent-21860
- Modelo base: https://huggingface.co/Robbyant-Research/zero-wam-pretrain
- Configuración del adaptador: https://huggingface.co/gulucaptain/RoboKata-A-latent-21860/blob/main/adapter_config.json
