# Oscilla/Qwen2.5-Coder-3B-Instruct-mlx-4Bit

## Resumen

Oscilla/Qwen2.5-Coder-3B-Instruct-mlx-4Bit es una conversión al formato MLX del modelo Qwen2.5-Coder-3B-Instruct, desarrollado originalmente por Alibaba Cloud. Esta versión, publicada por el usuario Oscilla, aplica una cuantización de 4 bits para optimizar su ejecución en dispositivos Apple Silicon mediante la librería mlx-lm. El modelo base es un transformer decoder-only especializado en generación, razonamiento y corrección de código, con capacidades conversacionales y de instrucciones.

La relevancia de esta conversión radica en que permite ejecutar un modelo de código de 3.000 millones de parámetros en hardware de Apple con un consumo de memoria reducido (el repositorio ocupa 1,7 GB). Aunque el modelo base está pensado para tareas de programación, esta versión cuantizada sacrifica algo de precisión a cambio de eficiencia, lo que la hace adecuada para prototipos y entornos con recursos limitados. No se dispone de información sobre la longitud de contexto ni sobre el rendimiento específico de esta conversión, ya que la model card es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5) |
| Parametros totales | 482.381.824 (segun safetensors; el modelo base Qwen2.5-Coder-3B-Instruct tiene 3.090.000.000) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta 32.768 tokens, pero no se confirma en esta conversion) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | Ingles (segun metadata; el modelo base es multilingue) |
| Licencia | qwen-research (licencia de investigacion de Qwen, no comercial) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-3B-Instruct emplea una arquitectura transformer con atención causal, similar a la familia Qwen2.5. Fue entrenado con un corpus extenso de código fuente y texto, seguido de un ajuste fino por instrucciones (instruct). El proceso de conversión a MLX realizado por Oscilla no modifica la arquitectura subyacente; únicamente transforma los pesos al formato optimizado para Apple Silicon y aplica cuantización de 4 bits. No se han publicado detalles sobre el dataset de entrenamiento ni sobre técnicas adicionales como RLHF o DPO para esta conversión concreta.

La cuantización de 4 bits reduce el tamaño del modelo y acelera la inferencia en hardware compatible con MLX, pero puede introducir una ligera degradación en la calidad de las respuestas en comparación con la versión de precisión completa.

## Capacidades

- Generación de codigo en multiples lenguajes de programacion (Python, Java, C++, JavaScript, etc.).
- Razonamiento sobre fragmentos de codigo: explicar, depurar y refactorizar.
- Correccion de errores y sugerencias de mejora.
- Soporte de chat conversacional y seguimiento de instrucciones.
- Capacidades multilingues limitadas: el modelo base soporta varios idiomas, pero esta conversion esta etiquetada solo para ingles.
- No se confirma soporte explicito de tool calling o function calling en esta version.
- No se ha verificado la capacidad de modo thinking o razonamiento extendido.

## Casos de uso

- Autocompletado de codigo en editores: al integrarse con herramientas como VS Code o Neovim mediante MLX, puede sugerir fragmentos y completar funciones en tiempo real.
- Asistente de programacion en terminal: uso interactivo para resolver dudas sobre APIs, sintaxis o algoritmos.
- Generacion de scripts y automatizaciones: crear scripts de bash, Python o PowerShell para tareas de administracion de sistemas.
- Educacion y aprendizaje: explicar conceptos de programacion y generar ejemplos de codigo para estudiantes.
- Prototipado rapido en entornos Apple: desarrollo de aplicaciones iOS o macOS donde el modelo se ejecuta localmente sin conexion.
- Analisis estatico de codigo: revisar fragmentos de codigo y detectar posibles errores o malas practicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta conversion MLX 4-bit. El modelo base Qwen2.5-Coder-3B-Instruct cuenta con evaluaciones en HumanEval, MBPP y otros benchmarks de codigo, pero esos datos no se han replicado en esta version cuantizada. Se recomienda consultar la documentacion oficial de Qwen para obtener metricas del modelo original.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para inferencia con cuantizacion 4-bit (el repositorio ocupa 1,7 GB).
- GPU recomendadas: Apple Silicon (M1, M2, M3 o superiores) con al menos 8 GB de memoria unificada.
- Compatible con cualquier Mac con chip Apple Silicon; no requiere GPU dedicada.
- Opciones de despliegue: mlx-lm (libreria oficial de MLX), tambien se puede cargar con transformers si se convierte el formato.
- Latencia y throughput estimados: no disponibles; dependen del modelo de chip y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Oscilla/Qwen2.5-Coder-3B-Instruct-mlx-4Bit | 3B (base) | No disponible | 4-bit MLX | qwen-research | MLX |
| Qwen2.5-Coder-1.5B-Instruct | 1.5B | 32K | No cuantizado | qwen-research | safetensors |
| CodeLlama-3B-Instruct | 3B | 16K | No cuantizado | Llama 2 license | safetensors |
| StarCoder2-3B | 3B | 16K | No cuantizado | BigCode OpenRAIL-M | safetensors |

La comparacion directa con estos modelos requiere ejecutar benchmarks en el mismo hardware, lo cual no se ha realizado para esta conversion. La principal ventaja de la version MLX es su optimizacion para Apple Silicon, mientras que los otros modelos pueden requerir conversion adicional.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso a fines de investigacion; no permite uso comercial.
- La cuantizacion de 4 bits puede degradar la precision en tareas complejas de razonamiento o generacion de codigo.
- No se ha verificado la compatibilidad con tool calling ni con funciones de agente.
- El modelo esta etiquetado solo para ingles; su rendimiento en otros idiomas puede ser limitado.
- No hay informacion sobre sesgos o alucinaciones especificos de esta conversion; se heredan los del modelo base.
- La fecha de creacion del repositorio es posterior a la fecha actual (2026), lo que sugiere que podria ser un artefacto de metadatos; se recomienda verificar la integridad del modelo.
- No se dispone de datos de latencia ni de throughput para entornos de produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Oscilla/Qwen2.5-Coder-3B-Instruct-mlx-4Bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Coleccion oficial de Qwen2.5-Coder: https://huggingface.co/collections/Qwen/qwen25-coder
- Coleccion de conversiones MLX de Qwen2.5-Coder: https://huggingface.co/collections/mlx-community/qwen25-coder
- Repositorio de MLX en GitHub: https://github.com/ml-explore/mlx
- Documentacion de mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms
