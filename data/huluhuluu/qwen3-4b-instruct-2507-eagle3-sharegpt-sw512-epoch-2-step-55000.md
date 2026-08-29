# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-2-step-55000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-2-step-55000` es un modelo de borrador (draft model) diseñado exclusivamente para decodificación especulativa sobre el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat independiente, sino un componente auxiliar que acelera la inferencia del modelo base sin alterar su distribución de salida. Lo desarrolla el usuario huluhuluu mediante el framework SpecForge, que implementa el algoritmo EAGLE3 de entrenamiento online de borradores.

El modelo se entrenó sobre datos ShareGPT limpios durante 10 épocas, con un total de 231.810 pasos de optimización, y se publica en repositorios separados por checkpoint (este corresponde a la época 2, paso 55.000). Su arquitectura es una sola capa de decoder con atención de ventana deslizante de 512 tokens, lo que lo hace extremadamente ligero: apenas 202,7 millones de parámetros, frente a los 4.000 millones del modelo objetivo. Su relevancia radica en que permite reducir la latencia de generación en despliegues con SGLang, especialmente en entornos de producción donde el coste por token es crítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, hidden size 2560, intermediate size 9728, 32 cabezas de atencion, 8 cabezas key/value, atencion causal con ventana deslizante de 512 tokens) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (maxima secuencia de entrenamiento); ventana deslizante de atencion de 512 tokens |
| Tipos de cuantizacion | bfloat16 (unico formato publicado) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura EAGLE3, una variante de decodificación especulativa que entrena un pequeño modelo auxiliar para predecir los siguientes tokens del modelo objetivo. En este caso, se trata de una única capa de decoder con hidden size 2560, intermediate size 9728 y 32 cabezas de atención con 8 cabezas key/value, usando atención con ventana deslizante de 512 tokens. El vocabulario del borrador es de 32.000 tokens, mientras que el vocabulario objetivo del modelo base es de 151.936 tokens, por lo que se aplica una proyección de embedding entre ambos espacios.

El entrenamiento se realizó de forma online con SpecForge, un framework que actualiza el borrador continuamente durante la inferencia. Los datos provienen de un dataset ShareGPT limpio (fuente local, sin revisión registrada). Los hiperparámetros principales incluyen: 10 épocas, 231.810 pasos de optimización, batch efectivo de 4, learning rate de 1e-4 con warmup lineal del 1,5% y decaimiento coseno, weight decay 0,0, gradiente máximo 0,5, longitud máxima de secuencia 2048, longitud TTT de EAGLE3 de 7 tokens y backend objetivo SGLang con flashinfer. No se registraron métricas de evaluación ni de seguridad en la model card.

## Capacidades

- Decodificación especulativa: predice secuencias de tokens candidatos para el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`, acelerando la generación entre 2 y 3 veces en configuraciones típicas.
- Integración con SGLang: diseñado para usarse como ruta de borrador (draft path) en el servidor de inferencia SGLang, con soporte para árboles de especulación configurables.
- Compatibilidad con el modelo base exacto: solo funciona con el modelo objetivo indicado, no con otras variantes de Qwen3.
- Bajo coste computacional: al ser un modelo de 202M parámetros, su inferencia es muy rápida y apenas consume VRAM adicional.
- No dispone de capacidades de chat, tool calling, agentes ni razonamiento autónomo; su función es puramente auxiliar.

## Casos de uso

- Reducción de latencia en API de chat en tiempo real: al desplegar Qwen3-4B-Instruct-2507 con SGLang y este borrador, se puede reducir el tiempo de primer token y el tiempo entre tokens en aplicaciones de conversación interactiva.
- Optimización de costes de inferencia en producción: al acelerar la generación sin cambiar el modelo final, se puede atender más peticiones por segundo con el mismo hardware, reduciendo el coste por consulta.
- Investigación en decodificación especulativa: este checkpoint (época 2, paso 55.000) permite estudiar el efecto del entrenamiento online y la ventana deslizante en la calidad de las predicciones del borrador.
- Evaluación de árboles de especulación: los equipos de MLOps pueden ajustar los parámetros del árbol (tree settings) en SGLang para encontrar el equilibrio óptimo entre aceptación de tokens y sobrecarga computacional.
- Despliegue en entornos con recursos limitados: al requerir solo ~400 MB de VRAM adicionales, es viable en GPUs consumer como RTX 3060 o RTX 4090 cuando se combina con el modelo base cuantizado.
- Benchmarking de frameworks de inferencia: sirve como caso de prueba para comparar el rendimiento de SGLang frente a otras soluciones de decodificación especulativa (por ejemplo, Medusa o EAGLE-2) sobre el mismo modelo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se registraron metricas de evaluacion ni de seguridad para este entrenamiento. Se recomienda medir la tasa de aceptacion de tokens y la aceleracion relativa frente al modelo base en el entorno de despliegue concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en bfloat16 (202M parametros × 2 bytes), mas overhead del runtime. En la practica, se suma a la VRAM del modelo base (Qwen3-4B-Instruct-2507), que en bfloat16 ocupa unos 8 GB.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM si se combina con el modelo base sin cuantizar (por ejemplo, RTX 3060 12GB, RTX 4070, A10, L4). Para produccion a gran escala, A100 o H100.
- Compatibilidad con GPU consumer: si, siempre que se use junto con una cuantizacion del modelo base (por ejemplo, AWQ o GPTQ) que reduzca su huella de VRAM.
- Opciones de despliegue: SGLang (backend objetivo y recomendado), tambien se puede cargar con transformers para experimentacion, pero el flujo de decodificacion especulativa requiere SGLang.
- Latencia y throughput: no se han publicado mediciones. Depende del arbol de especulacion, la tasa de aceptacion y el hardware. En configuraciones tipicas con Qwen3-4B, se espera una aceleracion de 1.5x a 3x en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| Este modelo (EAGLE3 draft) | 202M | 2048 (ventana 512) | Borrador para decodificacion especulativa de Qwen3-4B-Instruct-2507 | Apache-2.0 |
| Qwen3-4B-Instruct-2507 (modelo base) | 4B | 32K | Modelo de chat/instruccion general | Apache-2.0 |
| EAGLE-2 draft models (para otros modelos) | Variable (tipicamente <1B) | Depende del modelo base | Borrador para decodificacion especulativa | Depende del repositorio |

No se dispone de datos de rendimiento comparativo con otros borradores (por ejemplo, Medusa o EAGLE-2) sobre el mismo modelo base. La eleccion entre alternativas debe basarse en pruebas empiricas de tasa de aceptacion y latencia en el entorno objetivo.

## Limitaciones y advertencias

- No es un modelo de chat autonomo: no puede generar respuestas por si mismo y debe emparejarse siempre con `Qwen/Qwen3-4B-Instruct-2507`.
- Sin metricas de seguridad o calidad: la model card no registra evaluaciones de sesgos, alucinaciones ni robustez. No se recomienda su uso en aplicaciones donde la seguridad sea critica sin una validacion previa.
- Ventana deslizante de 512 tokens: la atencion del borrador solo cubre los ultimos 512 tokens, lo que puede reducir la calidad de las predicciones en contextos muy largos (aunque el modelo base mantiene su ventana completa).
- Dependencia de SGLang: el flujo completo de decodificacion especulativa requiere SGLang con flashinfer; otras librerias pueden no soportar este formato de borrador.
- Unico formato de pesos: solo se publica en bfloat16, sin cuantizaciones GGUF ni AWQ, lo que limita su uso en entornos con restricciones de VRAM.
- Riesgo de desincronizacion: si el modelo base se actualiza o modifica, el borrador deja de ser valido y debe reentrenarse.
- Uso comercial permitido bajo Apache-2.0, pero sin garantias de soporte ni mantenimiento por parte del autor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-2-step-55000
- Repositorio del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio oficial de Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Documentacion de Qwen3 en DeepWiki: https://deepwiki.com/QwenLM/Qwen3
- Pagina de Qwen3 en LM Studio: https://lmstudio.ai/models/qwen3
