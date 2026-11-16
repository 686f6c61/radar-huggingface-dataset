# Cialtion/SimpleFun-Gemma4-E4B-4Head-v3-BF16

## Resumen

SimpleFun-Gemma4-E4B-4Head-v3-BF16 es un ajuste fino (fine-tuning) del modelo google/gemma-4-E4B-it desarrollado por el usuario Cialtion. Se trata de un modelo conversacional de texto orientado a dar vida a un personaje companion (SimpleFun/SimpleLove) con cuatro "cabezas" o canales de decodificacion independientes: `<speech>`, `<expression>`, `<inner>` y `<command>`. Cada canal se decodifica por separado a partir del mismo prompt visible de sistema y usuario, compartiendo los pesos del modelo base.

El modelo se entrena mediante LoRA (r128/alpha256) durante una epoca sobre 16.609 turnos de dialogo, y posteriormente se fusiona en un checkpoint completo en BF16. El repositorio contiene 7.463.066.666 elementos tensoriales (el embedding de salida esta atado y se almacena una sola vez), con un vocabulario ampliado a 262.148 entradas para incorporar los cuatro tokens de canal (ids 262144-262147). No requiere adaptador PEFT ni modelo base en inferencia.

Es relevante ahora porque explora un patron poco habitual: decodificacion multi-canal con pesos compartidos sobre un modelo Gemma 4 de la familia E4B, con un contrato de prompt estricto y un enfoque de personaje con narracion interna separada del razonamiento. La licencia es la Gemma original y los idiomas declarados son chino, ingles y japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 text, `gemma4_text`), multi-canal con pesos compartidos |
| Parametros totales | 7.463.066.666 elementos tensoriales (BF16) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en el repositorio; otras cuantizaciones no disponibles (la adaptacion a iPhone se menciona como paso separado no establecido) |
| Idiomas soportados | zh, en, ja |
| Licencia | Gemma (licencia original de Google) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un transformer decoder-only de la familia Gemma 4. Sobre el se aplica un LoRA con rango 128 y alpha 256 durante una epoca sobre 16.609 turnos de dialogo, tras lo cual se fusiona en un checkpoint completo en BF16. La innovacion principal es la decodificacion multi-cabeza: cuatro canales (`<speech>`, `<expression>`, `<inner>`, `<command>`) con token ids 262144, 262145, 262146 y 262147, que comparten los mismos pesos del modelo y se decodifican de forma independiente a partir del mismo prompt de sistema y usuario. El vocabulario se amplia a 262.148 entradas.

El entrenamiento incluye embeddings por capa (PLE, per-layer embeddings), y el autor advierte explicitamente de que las filas PLE y las filas de entrada/salida de cada token de canal deben conservarse durante cualquier conversion. El contrato de prompt exige usar el shell nativo de Gemma con un canal de pensamiento vacio cerrado explicitamente antes del marcador de canal, y detenerse en `<turn|>` (token 106). No se generan tokens de pensamiento en este protocolo. La temperatura de muestreo por defecto del producto es 0,7.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a personaje companion.
- Decodificacion multi-canal: produce de forma separada habla (`<speech>`), expresion (`<expression>`), narracion interna del personaje (`<inner>`) y comandos (`<command>`).
- Soporte de tool calling mediante el canal `<command>`, sujeto a validacion en la aplicacion contra las declaraciones de herramientas vigentes.
- Capacidades multilingues en chino, ingles y japones.
- Contrato de prompt estricto con JSON compacto de usuario que incluye historial, memorias y consulta.
- No incluye vision, audio, ASR, TTS ni canto: el repositorio contiene unicamente pesos de texto.

## Casos de uso

- Personajes companion conversacionales: el modelo separa habla visible, expresion emocional y narracion interna, lo que permite construir agentes de personaje con capas de presentacion distintas a partir de una sola inferencia multi-canal.
- Sistemas de dialogo con memoria: el contrato de prompt acepta un JSON de usuario con historial y memorias, adecuado para asistentes que mantienen estado persistente entre turnos.
- Ejecucion de acciones mediada por herramientas: el canal `<command>` permite emitir llamadas a herramientas que la aplicacion valida antes de ejecutar, util en asistentes de productividad o automatizacion.
- Prototipado de agentes con narracion interna: el canal `<inner>` sirve para depurar la "voz interna" del personaje sin exponerla al usuario final.
- Localizacion de experiencias conversacionales en zh/en/ja: el soporte declarado de los tres idiomas permite desplegar el mismo personaje en mercados de Asia Oriental y anglosajones.
- Investigacion sobre decodificacion multi-cabeza: como checkpoint fusionado y reproducible (con hashes en EXPORT_DONE.json), sirve para estudiar tecnicas de pesos compartidos con canales independientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la inferencia de benchmark de las cuatro cabezas existente uso vLLM, pero no aporta cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 15 GB solo para pesos (7.463.066.666 elementos x 2 bytes), mas overhead de activaciones y cache KV.
- El tamano del repositorio es de 15,0 GB, coherente con el checkpoint BF16.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer con 24 GB o mas (RTX 4090, RTX 3090) para BF16 con margen limitado.
- Cabe en GPU consumer de 24 GB en BF16 con contexto corto; para contextos largos o mayor comodidad se recomienda cuantizacion (no publicada en este repositorio).
- Opciones de despliegue: transformers (libreria declarada); vLLM se menciona como usado en el benchmark de las cuatro cabezas. Otras opciones (llama.cpp, Ollama, TGI) no estan confirmadas para este checkpoint.
- Latencia y throughput: no disponibles. La adaptacion a iPhone y su cuantizacion se describen como un paso separado no establecido por esta publicacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SimpleFun-Gemma4-E4B-4Head-v3-BF16 | 7.463.066.666 elementos | no disponible | Gemma | Fine-tuning multi-canal de Gemma 4 E4B; solo texto; zh/en/ja |
| google/gemma-4-E4B-it | no disponible en la informacion | no disponible | Gemma | Modelo base instruct; sin canales multi-cabeza |
| Otros fine-tunes de Gemma 4 E4B | no disponible | no disponible | Gemma | No se dispone de alternativas comparables documentadas en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; hereda los del modelo base Gemma 4 E4B-it.
- Riesgo de alucinacion: no evaluado ni documentado; el canal `<inner>` es narracion privada del personaje y no debe interpretarse como razonamiento verificado.
- El canal `<command>` no debe ejecutarse sin validacion en la aplicacion contra las declaraciones de herramientas vigentes.
- Limitaciones de idioma: solo se declaran zh, en y ja; el rendimiento en castellano no esta documentado.
- Restricciones de licencia: se aplica la licencia Gemma original de Google, con sus terminos de uso comercial y redistribucion.
- El modelo es solo texto: no incluye vision, audio, ASR, TTS ni canto.
- Durante cualquier conversion hay que preservar los embeddings por capa (PLE) y las filas de los tokens de canal; descartarlos rompe el modelo.
- La adaptacion a iPhone y su cuantizacion no estan establecidas por esta publicacion.
- El repositorio excluye archivos de optimizador/RNG/checkpoint y las preguntas y respuestas de evaluacion, por lo que la reproducibilidad del entrenamiento es parcial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Cialtion/SimpleFun-Gemma4-E4B-4Head-v3-BF16
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
