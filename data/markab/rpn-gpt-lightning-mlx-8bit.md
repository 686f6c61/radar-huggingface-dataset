# markab/rpn-gpt-lightning-MLX-8bit

## Resumen

rpn-gpt-lightning-MLX-8bit es una cuantización de 8 bits para Apple Silicon del modelo rpn-gpt-lightning, un fine-tune de NVIDIA Nemotron 3.5 Lightning (30B de parámetros totales, 3B activos) orientado a generar programas en Forth que ejecutan aritmética exacta sobre una máquina RPN (Reverse Polish Notation). Lo desarrolla el usuario markab y se distribuye bajo la licencia OpenMDW 1.1 heredada del modelo base de NVIDIA, con las aportaciones propias (fine-tune, tarjeta y código) bajo licencia MIT.

El modelo no calcula por sí mismo: su función es escribir el código Forth que un cliente externo (`rpn_chat.py`) interpreta en una máquina Forth, lo que permite obtener resultados aritméticos exactos sobre enteros grandes sin depender de la precisión aproximada de un transformer. La conversión se realizó con mlx-lm 0.32.2 aplicando cuantización de 8 bits con tamaño de grupo 64, lo que resulta en 8,502 bits por peso y un repositorio de 33,6 GB.

Es relevante porque explora una vía poco habitual para resolver problemas aritméticos con LLM: en lugar de pedir al modelo que compute, se le pide que genere código verificable y ejecutable. La versión de 8 bits, sin embargo, no ha sido evaluada por el autor; la validación (3 de 3 en un M4 Max) corresponde a la variante de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NVIDIA Nemotron 3.5 Lightning (tag `nemotron_h`), transformer con mezcla de expertos |
| Parametros totales | 31.577.935.872 (aproximadamente 30B) |
| Parametros activos | 3B (según la model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64 (8,502 bits por peso); existe una variante de 4 bits del mismo autor |
| Idiomas soportados | inglés (`en`) |
| Licencia | OpenMDW License Agreement 1.1 (modelo base NVIDIA); fine-tune, tarjeta y código bajo MIT |
| Formato de pesos | safetensors (MLX), librería `mlx` |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA Nemotron 3.5 Lightning, un transformer con arquitectura de mezcla de expertos de 30B parámetros totales y 3B activos, tal como indica el autor. Sobre esa base se aplicó un fine-tune supervisado con el dataset `markab/rpn-gpt-data` para especializarlo en la generación de programas Forth que resuelven expresiones aritméticas en notación polaca inversa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica principal no reside en la arquitectura, sino en el diseño del sistema: el modelo solo emite el código Forth y la ejecución exacta la realiza una máquina Forth externa gestionada por `rpn_chat.py`. Esta separación entre generación y cómputo permite obtener resultados exactos en operaciones con enteros de gran tamaño (por ejemplo, restos de divisiones de números de 17 dígitos). La cuantización se hizo con `mlx_lm.convert -q --q-bits 8 --q-group-size 64` sobre mlx-lm 0.32.2, la misma herramienta empleada en la versión de 4 bits probada.

## Capacidades

- Generación de código Forth para una máquina RPN, orientada a aritmética entera exacta.
- Resolución de operaciones aritméticas (sumas, restas, multiplicaciones, divisiones y restos) mediante generación de programas ejecutables en lugar de cálculo directo.
- Conversación de un solo turno o multi-turno a través del pipeline `text-generation`.
- Integración con servidores compatibles con la API de mlx-lm (`mlx_lm.server`).
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Aritmética exacta con enteros grandes: el modelo genera el Forth necesario para calcular restos, divisiones o productos de números de muchas cifras, y `rpn_chat.py` lo ejecuta en la máquina Forth, evitando los errores de redondeo típicos de un LLM.
- Verificación de cálculos en pipelines de datos: se puede usar como generador de programas verificables para comprobar resultados numéricos en procesos ETL o auditorías, ya que el código Forth generado es inspeccionable y reproducible.
- Enseñanza de Forth y RPN: sirve como generador de ejemplos y ejercicios de programación en notación polaca inversa para entornos educativos.
- Prototipado de asistentes aritméticos locales en Apple Silicon: al ejecutarse con MLX en un Mac con memoria unificada suficiente, permite desplegar un asistente de cálculo exacto sin conexión a servicios en la nube.
- Investigación sobre neuro-simbólico: útil para estudiar la frontera entre generación de lenguaje y ejecución simbólica, comparando la precisión del modelo con la de un intérprete Forth determinista.
- Automatización de cálculos en scripts de línea de comandos: mediante el servidor mlx-lm y el cliente `rpn_chat.py`, se puede integrar en flujos de shell para resolver expresiones aritméticas puntuales.
- Base para fine-tunes experimentales: al estar el código y el dataset publicados, sirve como punto de partida para adaptar el enfoque a otros lenguajes o máquinas simbólicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la versión de 8 bits no fue ejecutada y que su precisión no se ha medido; los únicos datos de validación mencionados (3 de 3 en un M4 Max) corresponden a la variante de 4 bits.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 33,6 GB en safetensors de 8 bits, por lo que se necesita al menos esa cantidad de memoria unificada disponible para cargar los pesos.
- Hardware objetivo: Apple Silicon con memoria unificada amplia; el autor probó la variante de 4 bits en un M4 Max, y la de 8 bits requiere más memoria que esta.
- No cabe en GPUs de consumo con 24 GB (RTX 4090) ni en configuraciones de 16 GB; en el ecosistema Apple, requiere equipos con 36 GB o más de memoria unificada.
- Despliegue: `mlx_lm.server` (versión 0.32.2) y el cliente `rpn_chat.py` del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte de que mlx_lm.server 0.32.2 puede detener la generación ante un acierto exacto de la caché de prompt en sesiones largas, y que `training/mlx_local.sh` incluye un parche para ello.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rpn-gpt-lightning-MLX-8bit | 30B totales / 3B activos | no disponible | Generación de Forth para aritmética exacta | OpenMDW 1.1 + MIT (partes propias) | Hugging Face, MLX |
| rpn-gpt-lightning (4 bits) | 30B totales / 3B activos | no disponible | Igual, cuantizado a 4 bits | OpenMDW 1.1 + MIT | Hugging Face, MLX |
| NVIDIA Nemotron 3.5 Lightning | 30B totales / 3B activos | no disponible | Modelo base generalista | OpenMDW 1.1 | Hugging Face, NVIDIA |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La versión de 8 bits no ha sido ejecutada ni evaluada por el autor; la precisión es desconocida y no debe asumirse equivalente a la de la variante de 4 bits.
- El modelo solo genera Forth: sin el cliente `rpn_chat.py` y la máquina Forth asociada, no resuelve cálculos por sí mismo.
- Idioma limitado al inglés según la model card; no se documenta soporte de castellano.
- Riesgo de alucinación en el código Forth generado: programas sintácticamente válidos pero semánticamente incorrectos pueden producir resultados erróneos sin aviso.
- La licencia OpenMDW 1.1 del modelo base impone condiciones que deben revisarse antes de un uso comercial; las partes propias son MIT, pero el conjunto hereda las restricciones de NVIDIA.
- El autor solicita atribución a rpn-gpt con enlace al repositorio de GitHub.
- Posible fallo de generación en `mlx_lm.server` 0.32.2 con aciertos exactos de caché de prompt en sesiones largas; requiere el parche incluido en el repositorio.
- Sin datos publicados sobre sesgos, contexto máximo ni comportamiento fuera del dominio aritmético.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/markab/rpn-gpt-lightning-MLX-8bit
- Modelo base: https://huggingface.co/markab/rpn-gpt-lightning
- Repositorio de código: https://github.com/markab21/rpn-gpt
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Referencia externa encontrada en la búsqueda (no relacionada directamente con el modelo): https://github.com/dwstevens/lightning-mlx
