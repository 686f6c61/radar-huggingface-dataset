# nzxyin/sparc-ddsp-24k

## Resumen

sparc-ddsp-24k es un modelo de audio publicado por el usuario nzxyin en Hugging Face. Por sus etiquetas (audio, speech, vocoder, articulatory, sparc) y su nombre, se trata de un vocoder DDSP (Differentiable Digital Signal Processing) integrado en el ecosistema SPARC, orientado a la síntesis de voz a partir de representaciones articulatorias. El modelo está entrenado sobre el dataset parler-tts/libritts_r_filtered y declarado para inglés.

El repositorio contiene pesos en formato safetensors con 7.038.180 parámetros (aproximadamente 7 millones), lo que lo sitúa en la categoría de modelos ligeros de síntesis de audio, muy por debajo de los vocoders neuronales de gran escala. La información pública disponible es muy limitada: no se detallan arquitectura interna, contexto, ni resultados de benchmarks.

Su relevancia es acotada y experimental: se trata de un artefacto de investigación con muy pocas descargas y sin pipeline declarado, distribuido bajo licencia MIT pero con acceso restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como vocoder DDSP / articulatory, sin detalle publicado) |
| Parametros totales | 7.038.180 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna del modelo. Las etiquetas del repositorio indican que se trata de un vocoder basado en DDSP (Differentiable Digital Signal Processing), una familia de modelos que combina sintesis de senal clasica con componentes neuronales diferenciables para generar audio a partir de parametros acusticos o articulatorios. La etiqueta "articulatory" sugiere que la entrada podria ser una representacion de tracto vocal o gestos articulatorios, aunque no se especifica el esquema exacto.

El entrenamiento se realizo sobre el dataset parler-tts/libritts_r_filtered, una version filtrada de LibriTTS-R, corpus de habla en ingles derivado de audiolibros. No se dispone de informacion sobre numero de tokens, composicion exacta del dataset, tecnicas de alineamiento, funciones de perdida ni si se aplicaron etapas de RLHF o DPO (poco habituales en vocoders). Tampoco se documentan innovaciones tecnicas adicionales.

## Capacidades

- Sintesis de voz en ingles a partir de representaciones articulatorias o acusticas, segun la naturaleza DDSP del modelo.
- Generacion de forma de onda de audio (vocoder), no de texto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue no disponible: solo se declara ingles.
- No se documentan modos especiales (thinking, vision, audio de entrada, etc.) mas alla de la generacion de audio.
- No se declara pipeline de Hugging Face, por lo que la integracion con `transformers` no esta garantizada.

## Casos de uso

- Investigacion en sintesis articulatoria: el modelo puede emplearse como vocoder de referencia para convertir trayectorias articulatorias en audio y comparar con sintetizadores clasicos en estudios de produccion del habla.
- Experimentos de DDSP en entornos academicos: su tamano reducido (unos 7 millones de parametros) permite iterar rapidamente en laboratorios con recursos limitados.
- Prototipado de pipelines TTS en ingles: integrado como etapa final de un sistema texto-a-voz que produzca parametros acusticos o articulatorios intermedios.
- Reproduccion de experimentos sobre LibriTTS-R: al haberse entrenado con parler-tts/libritts_r_filtered, sirve para replicar o extender resultados sobre ese corpus.
- Docencia en procesamiento de audio: util como ejemplo didactico de vocoder neuronal ligero y de sintesis diferenciable.
- Pruebas de integracion en toolchains de audio en PyTorch: al distribuirse en safetensors, puede cargarse directamente en scripts de inferencia personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa, dado el tamano de 7 millones de parametros (unos 28 MB en fp32 y 14 MB en fp16 para los pesos).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.), asi como en CPU para inferencia no interactiva.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLM). El despliegue previsible es mediante PyTorch nativo y carga de safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nzxyin/sparc-ddsp-24k | 7.038.180 | no disponible | Vocoder DDSP / articulatorio | MIT | Gated en Hugging Face |
| Vocoders DDSP de referencia (p. ej. implementaciones DDSP-SVC) | variable, tipicamente millones | no aplica | Sintesis de voz | variable (MIT/GPL segun proyecto) | Publicos |
| Vocoders neuronales tipo HiFi-GAN | decenas de millones | no aplica | Sintesis de voz | variable | Publicos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede complicar la automatizacion en CI/CD.
- Documentacion practicamente inexistente: no se especifican arquitectura, formato de entrada, ni procedimiento de inferencia, lo que eleva el coste de integracion.
- Solo ingles: no apto para sintesis en castellano ni otros idiomas sin reentrenamiento.
- Riesgo de alucinacion acustica: como todo vocoder generativo, puede producir artefactos o sonidos no inteligibles en entradas fuera de distribucion.
- Sesgos del corpus: entrenado sobre LibriTTS-R (audiolibros en ingles), por lo que puede reflejar sesgos de hablantes, acentos y calidad de grabacion de ese corpus.
- Uso comercial: la licencia MIT lo permite, pero al ser un artefacto de investigacion sin validacion publica, no es recomendable en produccion sin evaluacion previa.
- Sin pipeline declarado: la integracion con `transformers` u otras librerias de alto nivel no esta garantizada.
- Madurez muy baja: 2 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/nzxyin/sparc-ddsp-24k
- Dataset de entrenamiento: https://huggingface.co/datasets/parler-tts/libritts_r_filtered
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
