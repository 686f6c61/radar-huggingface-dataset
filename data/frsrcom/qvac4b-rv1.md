# frsrcom/qvac4b-rv1

## Resumen

qvac4b-rv1 es un modelo de lenguaje derivado de `qvac/TranslatePsy-AfriSLM-4B` al que se le ha compilado un ordenador RV32IM (RISC-V de 32 bits, entero, sin extensiones de multiplicacion ni coma flotante) dentro de sus capas Gated DeltaNet. Lo desarrolla el usuario `frsrcom` y se publica bajo licencia Apache 2.0. El objetivo no es mejorar el rendimiento conversacional, sino demostrar computacion verificable: el modelo ejecuta instrucciones RISC-V reales como parte de su mecanismo de atencion, de modo que una operacion aritmetica se resuelve mediante ejecucion determinista de codigo en lugar de prediccion estadistica de tokens.

La relevancia del modelo es experimental: forma parte de la linea de trabajo "chipformer" del autor, que inserta circuitos o procesadores dentro de modelos transformer para obtener salidas auditables. La model card documenta una prueba de decodificacion greedy bloqueada frente a `BR.Session` en Apple MPS, con coincidencia exacta de 1585/1585 y 2616/2616 tokens para dos llamadas de calculadora. Se trata de un artefacto de investigacion, con 16 descargas y ningun "like" en el momento de la consulta, no de un modelo listo para produccion.

El repositorio ocupa 18,9 GB y contiene 9.381.981.888 parametros segun los pesos en safetensors, aunque el nombre comercial haga referencia a "4B" (el modelo base). La arquitectura declarada es `qwen3_5_text` con capas Gated DeltaNet, y el tokenizer fusionado incluye tokens de herramienta con un desplazamiento especifico (`chip_token_offset` 248320).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Gated DeltaNet y capas "chip" RV32IM embebidas (tag `qwen3_5_text`) |
| Parametros totales | 9.381.981.888 (segun safetensors); el modelo base se denomina "4B" |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 18,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de `qvac/TranslatePsy-AfriSLM-4B` y le incorpora un procesador RV32IM compilado en las capas Gated DeltaNet, siguiendo la misma ruta `chipformer/q35` empleada en Bursar-9B. Segun `chipformer.json`, la red contiene 11 capas "chip", con `chip_token_offset` 248320, `chip_dims_offset` 2560 y dimension oculta 3968; la torre de vision del modelo original se ha eliminado. La innovacion principal es que la aritmetica se delega a un interprete RISC-V determinista incrustado en el flujo de atencion, lo que permite verificar la salida comparando la traza de ejecucion del chip con la decodificacion del modelo.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. El modelo base es un ajuste fino orientado a traduccion y psicologia (AfriSLM), pero la model card no detalla ese proceso. Tampoco se documentan tecnicas como decodificacion especulativa o atencion lineal mas alla de las propias capas Gated DeltaNet.

## Capacidades

- Generacion de texto y decodificacion autoregresiva greedy verificable contra una sesion de referencia (`BR.Session`).
- Ejecucion de calculo aritmetico mediante un RV32IM embebido: la model card demuestra `calc 12*34` → `408` y `calc 2*(3+4)-50` → `-36` con coincidencia token a token.
- Soporte de tool calling a traves de la API `chipformer.rv.bridge.Text` y del tokenizer sin procesar; el `AutoTokenizer` de Transformers parte incorrectamente `<tool_call>` en este tokenizer fusionado.
- Computacion verificable: la salida aritmetica es auditable mediante la traza del procesador RISC-V.
- Capacidades multilingues: no disponibles (heredadas potencialmente del modelo base, sin documentar).
- Vision: no disponible; la torre de vision fue eliminada.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Verificacion de aritmetica en pipelines de agentes: usar el RV32IM embebido para resolver operaciones enteras de forma determinista y auditar la traza frente a la salida del modelo, evitando errores de calculo por alucinacion numerica.
- Investigacion en computacion verificable: servir como banco de pruebas para comparar decodificacion greedy con ejecucion de circuito en modelos hibridos con Gated DeltaNet.
- Evaluacion de tool calling de bajo nivel: integrar la API `chipformer.rv.bridge.Text` en un harness propio para probar el tokenizer fusionado y el formato `<tool_call>` sin depender de `AutoTokenizer`.
- Reproduccion de experimentos chipformer: replicar la ruta `chipformer/q35/merge.py` para estudiar como se compilan circuitos RISC-V en capas de atencion y que efecto tienen en la perplejidad.
- Docencia sobre arquitecturas hibridas: ilustrar en un curso la diferencia entre prediccion estadistica de digitos y ejecucion determinista de instrucciones dentro de un transformer.
- Pruebas de regresion de tokenizers: validar el comportamiento de un tokenizer fusionado con tokens de herramienta y offsets personalizados antes de desplegarlo en un sistema mayor.

## Benchmarks y rendimiento

La unica evaluacion publicada en la informacion disponible es la prueba de decodificacion greedy bloqueada frente a `BR.Session` en Apple MPS:

| Llamada | Salida esperada | Tokens coincidentes |
|---|---|---|
| `calc 12*34` | `408` | 1585/1585 |
| `calc 2*(3+4)-50` | `-36` | 2616/2616 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; con 9,38 mil millones de parametros, en FP16 requeriria aproximadamente 18,8 GB solo para pesos, lo que encaja con el tamano de 18,9 GB del repo. En cuantizaciones de 8 bits o 4 bits el requisito bajaria, pero no se publican pesos cuantizados.
- GPU recomendadas: no documentadas. La unica plataforma mencionada es Apple MPS para la prueba de verificacion.
- Cabe en GPU de consumo: previsiblemente en tarjetas con 24 GB o mas (RTX 3090, RTX 4090) en FP16, aunque no esta confirmado por el autor.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI. El autor indica el uso de la API `tokenizers` / `chipformer.rv.bridge.Text` y de `BR.Session`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qvac4b-rv1 | 9,38 B (declarado "4B") | no disponible | Gated DeltaNet + RV32IM embebido | Apache 2.0 | Hugging Face, 16 descargas |
| qvac/TranslatePsy-AfriSLM-4B (base) | no disponible | no disponible | Traduccion y psicologia (AfriSLM) | no disponible | Hugging Face |
| Bursar-9B | 9 B (aproximado por el nombre) | no disponible | Misma ruta chipformer/q35 | no disponible | Referenciado en la model card |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con adopcion minima (16 descargas, 0 likes); no hay evidencia de uso en produccion.
- El tokenizer fusionado rompe `AutoTokenizer` de Transformers al dividir `<tool_call>`; es necesario usar la API `tokenizers` sin procesar o `chipformer.rv.bridge.Text`.
- La torre de vision ha sido eliminada, por lo que no admite entradas de imagen.
- No se documentan sesgos, riesgos de alucinacion, idiomas soportados ni comportamiento fuera de las dos llamadas de calculadora verificadas.
- La verificacion se limita a decodificacion greedy bloqueada en Apple MPS; no hay pruebas en otras plataformas ni con muestreo.
- El nombre "4B" no coincide con los 9,38 mil millones de parametros de los pesos, lo que puede inducir a error al planificar recursos.
- Aunque la licencia es Apache 2.0, conviene revisar la licencia y los terminos del modelo base `qvac/TranslatePsy-AfriSLM-4B` antes de un uso comercial.
- El codigo fuente (`chipformer/q35/merge.py`, `~/Dev/qvac-bursar`) no esta incluido en el paquete, lo que dificulta la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frsrcom/qvac4b-rv1
- Modelo base: https://huggingface.co/qvac/TranslatePsy-AfriSLM-4B
- Repositorio de circuitos y merge (referenciado): `ethereus/experimental/riscv` (`chipformer/q35/merge.py`), sin URL publica en la informacion disponible
- Notas y script de conduccion (referenciados): `~/Dev/qvac-bursar`, local, sin URL publica
