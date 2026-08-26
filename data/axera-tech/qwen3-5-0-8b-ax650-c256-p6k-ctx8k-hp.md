# AXERA-TECH/Qwen3.5-0.8B-AX650-C256-P6K-CTX8K-HP

## Resumen

El modelo AXERA-TECH/Qwen3.5-0.8B-AX650-C256-P6K-CTX8K-HP es una adaptación del modelo Qwen3.5-0.8B, optimizada y cuantizada para su ejecución en el acelerador NPU AX650 de AXERA. El nombre del repositorio indica una ventana de contexto de 8K tokens (CTX8K) y una configuración específica para el chip AX650, un procesador neuronal de bajo consumo orientado a inferencia en el edge. El repositorio GitHub asociado (Qwen3_5.AXERA) documenta el flujo de conversión, que incluye cuantización GPTQ, exportación de módulos de visión y transformación de pesos para el runtime de AXERA.

El modelo se distribuye bajo licencia MIT, lo que facilita su integración en productos comerciales sin restricciones de copyleft. Dado que el proyecto AXERA se centra en el despliegue de LLMs en hardware embebido, esta ficha resulta relevante para desarrolladores que necesitan ejecutar un modelo de 0.8B parámetros con capacidades de visión en dispositivos de bajo consumo energético. La model card original es mínima (solo declara la licencia), por lo que gran parte de los detalles técnicos deben inferirse de la nomenclatura del repositorio y del repositorio GitHub vinculado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-0.8B) |
| Parametros totales | 0.8B |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens (indicado por CTX8K) |
| Tipos de cuantizacion | GPTQ-Int4 (según repo de modelos hermano y GitHub) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | axmodel (formato propietario de AXERA para NPU) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer de 0.8 mil millones de parametros perteneciente a la familia Qwen3.5. La adaptación de AXERA-TECH consiste en un proceso de cuantización GPTQ a 4 bits y la exportación a formato axmodel, un formato de pesos optimizado para el acelerador NPU AX650. El repositorio GitHub asociado describe un flujo que incluye "vision export", lo que sugiere que el modelo puede incorporar un módulo de visión (posiblemente un codificador visual) además del componente de lenguaje.

Los detalles sobre el entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. La cuantizacion GPTQ-Int4 se aplica posteriormente al entrenamiento, lo que reduce el peso del modelo a aproximadamente 0.5 GB en memoria, adecuado para hardware embebido.

## Capacidades

- Generacion de texto y razonamiento basico, heredado de las capacidades del modelo Qwen3.5-0.8B original.
- Procesamiento de vision (exportacion de modulo de vision mencionada en el repositorio GitHub), lo que permite entrada multimodal de imagenes.
- Inferencia en hardware NPU de bajo consumo mediante el formato axmodel.
- Cuantizacion a 4 bits para reduccion de memoria y aceleracion en hardware dedicado.
- Ventana de contexto de 2048 tokens, suficiente para tareas de chat y analisis de documentos cortos.
- No se ha confirmado soporte de tool calling o function calling en la informacion disponible.

## Casos de uso

- Inferencia en dispositivos de borde (edge AI): el modelo esta diseñado para ejecutarse en la NPU AX650, tipicamente integrada en camaras, routers y sistemas de automocion. Permite procesar consultas de texto en tiempo real sin conexion a la nube.
- Analisis de imagenes en camaras inteligentes: gracias al modulo de vision exportado, puede clasificar objetos o extraer informacion de capturas de video en el propio dispositivo.
- Asistentes de voz locales: con una ventana de 8k tokens, puede gestionar conversaciones de voz multi-turno en dispositivos con recursos limitados.
- Filtrado y clasificacion de documentos en sistemas embebidos: por ejemplo, en terminales de punto de venta o quioscos, para interpretar texto de recibos o formularios.
- Prototipado rapido de aplicaciones LLM en hardware AX650: los desarrolladores pueden descargar el modelo ya convertido y evitar el proceso de cuantizacion manual.
- Despliegue comercial sin royalties: gracias a la licencia MIT, el modelo puede integrarse en productos cerrados sin obligaciones de compartir el codigo fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de HuggingFace no incluye tablas de rendimiento, y el repositorio GitHub tampoco documenta metricas de latencia o exactitud para el modelo cuantizado. Se recomienda evaluar el modelo en el hardware objetivo antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.5 GB en cuantizacion GPTQ-Int4 (0.8B parametros × 4 bits + overhead de activaciones).
- GPU recomendadas: no requiere GPU; esta diseñado para la NPU AX650 de AXERA.
- Compatibilidad con GPU de consumo: no procede; el formato axmodel no es compatible con CUDA.
- Opciones de despliegue: SDK de AXERA (proporcionado por el fabricante), no compatible con vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles.
- Se recomienda verificar la disponibilidad de la NPU AX650 en el hardware objetivo y el SDK de AXERA para la carga del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| AXERA-TECH/Qwen3.5-0.8B-AX650-C256-P6K-CTX8K-HP | 0.8B | 8k | GPTQ-Int4 | MIT | AX650 NPU |
| Qwen3.5-0.8B (original) | 0.8B | 32k (tipico) | BF16/FP16 | Apache 2.0 | GPU/CPU |
| Qwen2.5-0.5B-Instruct | 0.5B | 32k | BF16/FP16 | Apache 2.0 | GPU/CPU |

La comparativa muestra que esta adaptacion de AXERA se diferencia por su formato de pesos propietario y su optimizacion exclusiva para la NPU AX650, mientras que el modelo original de Qwen requiere GPU o CPU convencional. La ventaja de esta variante es el despliegue en hardware de bajo consumo; la desventaja es la dependencia del ecosistema AXERA.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de seguridad. Al ser un modelo de 0.8B, su capacidad de razonamiento es limitada y puede producir respuestas incoherentes en tareas complejas.
- Riesgo de alucinacion: los modelos de 0.8B suelen presentar mayor tasa de alucinacion que modelos de mayor tamano, especialmente en tareas de hecho factual.
- Limitacion de contexto: la ventana de 8k tokens es corta para documentos largos; el modelo puede perder informacion en conversaciones extensas.
- Idiomas soportados no documentados: se recomienda probar con el idioma objetivo antes de desplegar.
- Formato propietario: los pesos estan en formato axmodel, no compatible con frameworks estandar (Transformers, llama.cpp). Solo se puede usar con el SDK de AXERA.
- No se ha publicado informacion sobre el dataset de entrenamiento ni el proceso de alineacion, lo que limita la confianza en la seguridad y el comportamiento del modelo en produccion.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/AXERA-TECH/Qwen3.5-0.8B-AX650-C256-P6K-CTX8K-HP
- Modelo hermano (GPTQ-Int4): https://huggingface.co/AXERA-TECH/Qwen3.5-0.8B-AX650-GPTQ-Int4-C256-P6K-CTX8K
- Repositorio GitHub de AXERA para Qwen3.5: https://github.com/AXERA-TECH/Qwen3_5.AXERA
- Variante con contexto 2047 y vision: https://d6108366.hf-mirror.com/AXERA-TECH/Qwen3.5-0.8B-AX650-C128-P1152-CTX2047
