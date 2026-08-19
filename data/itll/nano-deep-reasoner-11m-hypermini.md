# ITLL/Nano.Deep.Reasoner.11m-HyperMini

## Resumen

Nano.Deep.Reasoner.11m-HyperMini es un modelo de lenguaje de razonamiento profundo desarrollado por ITLL, diseñado para tareas de inferencia adaptativa con un presupuesto computacional mínimo. Se trata de un decoder-only de tipo transformer recurrente que combina bloques transformer estándar con un bloque de razonamiento recurrente compartido, memoria latente aprendida y un controlador de parada adaptativo. El modelo está pensado para explorar arquitecturas eficientes de razonamiento tipo chain-of-thought en entornos con recursos muy limitados.

Aunque el autor declara aproximadamente 11 millones de parámetros, el checkpoint real en safetensors contiene 14.934.003 parámetros, probablemente debido a los embeddings atados y a los componentes auxiliares. La longitud de contexto es de 1096 tokens, con un vocabulario de 16.000 tokens. El modelo se distribuye bajo licencia MIT y está disponible en HuggingFace con formato safetensors compatible con la librería transformers.

Su relevancia actual radica en la tendencia hacia modelos de razonamiento profundo (como DeepSeek-R1) pero en una escala extremadamente reducida, lo que permite experimentar con técnicas de razonamiento adaptativo en hardware de consumo o incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con bloque recurrente compartido y control adaptativo de profundidad |
| Parametros totales | 14.934.003 (según safetensors; el autor declara ~11.094.003) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1096 tokens |
| Tipos de cuantizacion | No especificado oficialmente; compatible con cuantización estándar de transformers (8-bit, 4-bit) |
| Idiomas soportados | No disponible (probablemente inglés, no confirmado) |
| Licencia | MIT |
| Formato de pesos | safetensors (también incluye tokenizer.json, config.json) |

## Arquitectura y entrenamiento

El modelo combina 6 bloques transformer base (con 8 cabezas de atención, dimensión de cabeza 30, hidden size 240 e intermediate size 1072) con un bloque de razonamiento recurrente compartido. Este bloque incorpora una memoria latente de 8 tokens aprendida, actualizaciones de memoria recurrente con compuertas (gated recurrent memory updates) y un controlador de parada adaptativo que permite una profundidad de razonamiento variable entre 2 y 16 iteraciones. Además incluye cabezas de verificación y revisión (verification head y revision head) para refinar el razonamiento. Usa RoPE (Rotary Position Embeddings), embeddings de entrada/salida atados y atención causal con enmascaramiento consciente de padding, junto con supresión explícita de estados padded.

El entrenamiento se realizó sobre el dataset `Plans11/Organized_PreTrain_1k_Context`, con sesiones que contienen hasta 20.000 ejemplos nuevos cada una, protegidos mediante hashes SHA-256 para evitar duplicados. El estado actual del entrenamiento indica 2 sesiones completadas, 40.000 ejemplos únicos procesados y 626 pasos globales de optimizador, con una pérdida final de sesión de 2,1403. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Razonamiento profundo adaptativo: el modelo puede iterar sobre su razonamiento entre 2 y 16 pasos, decidiendo cuándo detenerse mediante un controlador de parada.
- Generación de texto con marcadores de razonamiento: utiliza tokens especiales como `<thinking>`, `<reasoning>` y `<answer>` para estructurar la salida.
- Chain-of-thought: soporta cadenas de pensamiento explícitas dentro de la generación.
- Verificación y revisión: incorpora cabezas dedicadas a verificar y revisar el razonamiento generado.
- Memoria latente: mantiene un estado interno recurrente que le permite acumular información a lo largo de la generación.
- Compatible con la librería transformers: se puede cargar y ejecutar con el pipeline estándar de HuggingFace.

No se especifican capacidades de tool calling, visión, audio ni multilingüismo.

## Casos de uso

- Prototipado de agentes de razonamiento en dispositivos edge: gracias a su tamaño reducido, puede ejecutarse en microcontroladores o Raspberry Pi para experimentar con lógica de razonamiento en tiempo real.
- Investigación académica sobre razonamiento adaptativo: sirve como banco de pruebas para estudiar controladores de parada, memoria recurrente y arquitecturas híbridas transformer-recurrente.
- Generación de explicaciones estructuradas en aplicaciones educativas: puede producir respuestas con pasos de razonamiento explícitos para tutorías automáticas.
- Filtrado de contenido en sistemas embebidos: al ser ligero, puede integrarse en pipelines de moderación que requieran razonamiento básico sin depender de la nube.
- Experimentación con cuantización extrema: al tener solo ~15M parámetros, permite probar técnicas de cuantización (4-bit, 2-bit) en contextos de investigación.
- Aprendizaje de técnicas de prompting con razonamiento: los desarrolladores pueden estudiar cómo los marcadores `<thinking>` y `<answer>` afectan a la calidad de las respuestas en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 (~60 MB), en fp16 (~30 MB), en 8-bit (~15 MB), en 4-bit (~8 MB). Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna (incluso integradas), o directamente CPU. No requiere aceleración específica.
- Compatible con consumer GPU: sí, todas (GTX 1060 en adelante, RTX, etc.).
- Opciones de despliegue: transformers (Python), ONNX Runtime, llama.cpp (si se convierte a GGUF), o mediante la API de HuggingFace Inference Endpoints.
- Latencia y throughput: al ser un modelo pequeño, la latencia es de milisegundos en GPU y de decenas de milisegundos en CPU, dependiendo de la profundidad de razonamiento elegida. No se proporcionan cifras oficiales.

## Comparativa con modelos similares

No se dispone de modelos comparables con la misma arquitectura (transformer recurrente adaptativo de ~15M parámetros) y con datos de rendimiento publicados. Modelos como TinyLlama (1.1B) o GPT-2 (124M) son órdenes de magnitud mayores y no comparten el diseño recurrente. Por tanto, no se ofrece una comparativa cuantitativa.

## Limitaciones y advertencias

- Entrenamiento muy limitado: solo 40.000 ejemplos y 626 pasos de optimizador, lo que probablemente cause sobreajuste y falta de generalización.
- Contexto muy corto (1096 tokens): no es adecuado para tareas que requieran largas conversaciones o documentos extensos.
- Sin benchmarks publicados: no hay evidencia objetiva de su capacidad real frente a otros modelos.
- Idiomas no especificados: probablemente entrenado solo en inglés, con soporte multilingüe desconocido.
- Riesgo de alucinación: al ser un modelo pequeño con entrenamiento escaso, las alucinaciones pueden ser frecuentes.
- Sin alineación explícita: no se ha aplicado RLHF ni DPO, por lo que puede generar contenido no deseado.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías de calidad ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/ITLL/Nano.Deep.Reasoner.11m-HyperMini
- Dataset mencionado (sin URL pública confirmada): `Plans11/Organized_PreTrain_1k_Context` (referenciado en la model card).
