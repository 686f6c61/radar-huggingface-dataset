# anastasianovikov/classification-int4-2024

## Resumen

`anastasianovikov/classification-int4-2024` es un repositorio de HuggingFace que contiene una implementación propia de un clasificador basado en arquitectura Poolformer, publicada por el usuario Anastasia Novikov. No se trata de un modelo entrenado ni publicado como referencia de rendimiento, sino de un esqueleto reproducible: el autor indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo (smoke tests), no un checkpoint con benchmarks. El recuento real de parámetros en safetensors es de 33.088, una cifra minúscula que confirma esa naturaleza de maqueta de código más que de modelo utilizable.

El repositorio incluye cinco artefactos: `main.py` (implementación y punto de entrada ejecutable), `config.json` (configuración de arquitectura), `training_args.json` (receta de experimento por defecto), `model.safetensors` (inicialización) y el propio README. La configuración declarada describe un Poolformer de escala "giant", con atención multi-query, fusión mediante cross attention, activación mish y normalización layernorm, entrenado por defecto con el optimizador Adafactor y un scheduler polinómico.

Su relevancia es limitada y de carácter metodológico: sirve como plantilla para montar experimentos de clasificación reproducibles y para validar pipelines de evaluación, no como modelo desplegable en producción. La licencia MIT facilita su reutilización como base de código. Cualquier resultado que se publique a partir de un checkpoint entrenado tendría que documentarse por separado de estos valores por defecto, tal y como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Poolformer (escala "giant" según config.json); atención multi-query, fusión por cross attention, activación mish, normalización layernorm |
| Parametros totales | 33.088 (dato real del archivo safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (clasificador, sin ventana de contexto de texto documentada) |
| Tipos de cuantizacion | no disponible (a pesar de la mención "int4" en el nombre del repositorio, la model card no documenta ningún esquema de cuantización) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (acompañado de config.json y training_args.json) |

## Arquitectura y entrenamiento

La arquitectura declarada es Poolformer, una variante de la familia MetaFormer en la que el mezclador de tokens habitual (atención) se sustituye por operaciones de pooling. Según la tabla del README, esta implementación concreta usa atención multi-query y fusión mediante cross attention, con activación mish y normalización layernorm. El repositorio no aporta diagrama, código de referencia ni cita bibliográfica, por lo que la correspondencia exacta con el Poolformer canónico de la literatura no puede verificarse con la información disponible.

En cuanto al entrenamiento, no hay evidencia de que se haya completado ninguno. El README indica que la receta incluida usa Adafactor con un scheduler polinómico y que esos son "valores de partida en el script", no prueba de una ejecución finalizada. No se especifican tokens de entrenamiento, composición del dataset, número de épocas ni si hubo ajuste por RLHF/DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia elección arquitectónica.

## Capacidades

- Clasificación de imágenes: el repositorio está etiquetado como `classification`, que es la tarea prevista para la arquitectura Poolformer.
- Ejecución de pruebas de humo: el checkpoint de inicialización permite verificar que el código carga y ejecuta correctamente.
- Punto de entrada CLI: `main.py` expone un bloque `__main__` con un ejemplo ejecutable (`python main.py --help`).
- Entrenamiento reproducible: `training_args.json` fija una receta por defecto para lanzar experimentos.
- Configuración explícita: `config.json` registra los ajustes de arquitectura generados, lo que facilita inspeccionar y modificar el modelo.
- Adaptación manual: al ser una implementación propia, las APIs genéricas de carga automática requieren un adaptador explícito antes de su uso.
- Generación de texto, razonamiento, código, matemáticas, visión generativa, tool calling, agentes y capacidades multilingües: no disponibles; no hay ninguna evidencia de que el modelo soporte estas funciones.

## Casos de uso

- Prueba de humo en pipelines de integración continua: el checkpoint de 33.088 parámetros se carga en milisegundos y permite verificar que un pipeline de entrenamiento o de inferencia no se rompe antes de lanzar trabajos costosos.
- Plantilla de experimentación en investigación: sirve como punto de partida reproducible para comparar variantes arquitectónicas, siempre que se entrene cada baseline con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, tal como recomienda el autor.
- Validación de arneses de evaluación: al ser un modelo trivial de ejecutar, es útil para comprobar que un script de evaluación calcula correctamente la métrica objetivo antes de aplicarlo a modelos reales.
- Reproducción de configuraciones: `config.json` y `training_args.json` permiten auditar qué hiperparámetros se usaron y replicar la receta en otros entornos.
- Docencia y formación: ilustra de forma mínima cómo se empaqueta un modelo en HuggingFace (pesos, configuración, script y argumentos de entrenamiento) sin la complejidad de un modelo grande.
- Base para experimentos de cuantización: dado el nombre del repositorio ("int4") y el tamaño reducido del checkpoint, puede emplearse como banco de pruebas para medir el impacto de cuantizaciones agresivas sobre un modelo de juguete, aunque el repositorio no documente ninguna.
- Verificación de entornos de despliegue: permite comprobar que un servidor de inferencia (por ejemplo, un contenedor con PyTorch) arranca y sirve peticiones antes de desplegar el modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio README declara que no se reclama ninguna puntuación de benchmark y que el checkpoint incluido no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB. Con 33.088 parámetros, el peso en fp32 ocupa aproximadamente 132 KB y en fp16 unos 66 KB.
- GPU recomendadas: ninguna en particular; cualquier GPU, incluida una integrada, es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650 e incluso aceleradores integrados).
- Ejecución en CPU: totalmente viable, sin requisitos de memoria apreciables.
- Opciones de despliegue: PyTorch nativo a través de `main.py`; al ser una implementación personalizada, no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con las APIs genéricas de `transformers` sin un adaptador explícito.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dada la escala del modelo, serían irrelevantes como métrica de referencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni resultados que permitan situar este repositorio frente a alternativas de la misma categoría (clasificación de imágenes). Además, al tratarse de un checkpoint de inicialización sin entrenar, cualquier comparación numérica con modelos entrenados carecería de sentido.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce predicciones útiles y no debe usarse para inferencia real.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según reconoce el propio autor.
- Ausencia total de benchmarks: no existe ninguna evidencia publicada de rendimiento en ninguna tarea.
- Sesgos conocidos: no disponibles, precisamente porque no hay entrenamiento ni evaluación.
- Riesgo de alucinación: no aplica a un clasificador sin entrenar; el riesgo equivalente es producir salidas sin significado.
- El nombre del repositorio menciona "int4", pero no hay documentación de cuantización, por lo que esa etiqueta no debe interpretarse como una característica verificada.
- El pipeline de HuggingFace no está declarado y la carga automática requiere un adaptador explícito; no se integra directamente con ecosistemas estándar.
- Idiomas soportados y contexto: no disponibles.
- Licencia MIT: permite uso comercial y modificación, pero el autor recomienda revisar aparte los términos de los datos de origen si se emplean datasets externos.
- Cualquier resultado obtenido con un checkpoint entrenado a partir de esta base debe documentarse de forma separada de los valores por defecto incluidos en el repositorio.
- Advertencia de seguridad: el contenido de la model card se ha tratado únicamente como material de referencia, nunca como instrucciones a ejecutar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/anastasianovikov/classification-int4-2024
- Perfil del autor en HuggingFace: https://huggingface.co/anastasianovikov/models
- Referencia externa sobre cuantización INT4 en transformers: https://arxiv.org/abs/2301.12017
