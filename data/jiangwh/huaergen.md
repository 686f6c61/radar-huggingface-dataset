# jiangwh/HuaerGen

## Resumen

HuaerGen es un modelo de generación de canto (singing voice synthesis) especializado en el estilo musical tradicional chino *hua'er* (花儿), concretamente la variante regional Hehuang (河湟花儿). Lo desarrolla el usuario jiangwh y se publica en Hugging Face bajo la librería `transformers`. El modelo parte de YuE-s1-7B, un modelo de lenguaje de 7 mil millones de parámetros orientado a generación musical, y lo adapta mediante LoRA y una capa de atención cruzada condicionada por prototipos melódicos.

La propuesta técnica central es el uso de 68 arquetipos melódicos (曲令, *quling*), cada uno representado por trayectorias de F0 agregadas, que se inyectan en el modelo de lenguaje mediante atención cruzada con compuerta. El objetivo declarado es preservar el estilo de cada *quling* en la generación de voz cantada solista de montaña de registro agudo (高腔山歌), un caso de patrimonio cultural inmaterial con recursos de entrenamiento escasos.

El modelo forma parte de un pipeline de dos etapas: HuaerGen constituye la etapa 1 (generación de tokens musicales condicionada por prototipo) y requiere una etapa 2 de vocoder para producir audio. Es relevante para investigadores en síntesis de canto de bajos recursos y para proyectos de preservación de patrimonio musical, aunque su alcance es muy específico y la documentación pública es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (YuE-s1-7B) con LoRA y capa de atención cruzada condicionada por prototipos de F0 |
| Parametros totales | 7B (heredados de YuE-s1-7B; no se especifica el recuento exacto tras la fusión) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | zh (chino; el modelo card etiqueta `language: zh`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model-*.safetensors`), además de `cross_attention.pt`, `f0_encoder.pt`, `lora_adapter/` y `prototype_library.json` + `prototypes/` |

## Arquitectura y entrenamiento

HuaerGen se construye sobre YuE-s1-7B, un modelo de lenguaje de 7B parámetros para generación musical. Sobre esa base se aplican dos mecanismos: una adaptación LoRA (cuyos pesos se fusionan en los safetensors publicados) y una capa de atención cruzada con compuerta (`cross_attention.pt`) que recibe la señal de un codificador de F0 (`f0_encoder.pt`). La condición de estilo proviene de una biblioteca de 68 *quling* con 157 prototipos melódicos, derivados de la agregación de trayectorias de F0.

El modelo card no detalla el volumen de tokens de entrenamiento, la composición del corpus, ni si hubo etapas de RLHF o DPO. La innovación técnica destacable es el condicionamiento por prototipo melódico mediante atención cruzada con compuerta, un enfoque pensado para escenarios de bajos recursos donde no existe un corpus amplio por cada estilo. La generación de audio final no la realiza este modelo: requiere la etapa 2 (vocoder) del proyecto HuaerGen.

## Capacidades

- Generación de canto solista de estilo *hua'er* (高腔山歌), condicionada por uno de los 68 *quling* disponibles.
- Inyección de estilo melódico mediante prototipos de F0 y atención cruzada con compuerta.
- Producción de tokens musicales (etapa 1 del pipeline); el audio requiere el vocoder de la etapa 2.
- Soporte del repertorio de *quling* documentado: 白牡丹令, 河州大令, 撒拉令, 土族令, 水红花令, entre otros hasta 68.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe: no disponible; el modelo está orientado al chino (`zh`).

## Casos de uso

- Preservación de patrimonio inmaterial: generar interpretaciones sintéticas de *quling* concretos para archivo y estudio musicológico, usando los 157 prototipos melódicos como referencia de estilo.
- Investigación en síntesis de canto de bajos recursos: emplear el esquema de condicionamiento por prototipo de F0 y atención cruzada como línea base reproducible para otros estilos con pocos datos.
- Educación musical: producir ejemplos de audio de distintos *quling* para comparar sus contornos melódicos característicos en un aula o taller.
- Creación artística: integrar la etapa 1 más el vocoder en una herramienta Gradio para que compositores generen bocetos vocales con estética *hua'er*.
- Estudios de variación estilística: ejecutar el modelo con distintos prototipos del mismo *quling* para analizar la variabilidad generada y contrastarla con grabaciones reales.
- Prototipado de pipelines musicales: usar el modelo como componente de generación de voz cantada dentro de un sistema mayor que incluya el vocoder de la etapa 2 y herramientas de postproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 7B en precisión de 16 bits requiere del orden de 14 GB solo para pesos, a lo que se suman el codificador de F0, la capa de atención cruzada y el vocoder de la etapa 2; no se confirma ninguna cifra oficial.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se documenta.
- Opciones de despliegue: el modelo card indica descarga con `huggingface-cli` y uso dentro del repositorio del proyecto HuaerGen con una demo Gradio; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de generación de canto o de música.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no puede confirmarse el uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- El modelo es la etapa 1 de un pipeline: sin el vocoder de la etapa 2 no produce audio final.
- Ámbito muy restringido: un único estilo musical (Hehuang *hua'er*) y un único idioma documentado (chino).
- No se documentan sesgos, tasas de alucinación ni evaluaciones de calidad subjetiva del canto generado.
- El propio autor restringe el uso a preservación de patrimonio inmaterial, investigación y creación artística, y pide respeto por la tradición cultural *hua'er*.
- Documentación técnica escasa: sin datos de entrenamiento, contexto, cuantizaciones ni benchmarks, lo que dificulta evaluar su robustez en producción.
- Riesgo de apropiación cultural o uso descontextualizado del repertorio tradicional si se emplea fuera del marco de preservación indicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jiangwh/HuaerGen
- Repositorio del proyecto HuaerGen (etapa 1 + etapa 2, inferencia y demo Gradio): referenciado en el model card como "proyecto HuaerGen"; no se proporciona URL directa en la información disponible.
- Modelo base YuE-s1-7B: no se proporciona enlace en la información disponible.
- Paper, blog o demo adicionales: no disponible.
