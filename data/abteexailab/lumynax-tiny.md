# AbteeXAILab/lumynax-tiny

## Resumen

LumynaX Tiny Seed V1 es un modelo de generación de texto publicado por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda) centrado en inteligencia artificial soberana. Según su propia model card, se trata de un artefacto de investigación temprano, marcado explícitamente como "legacy" y "outdated", que se conserva únicamente con fines de reproducibilidad y trazabilidad histórica. No representa las capacidades actuales de la familia LumynaX ni debe usarse en producción.

El modelo está registrado en Hugging Face con el pipeline de text-generation, la librería transformers y etiquetas de idioma para inglés (en) y maorí (mi). El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que no contiene pesos publicados o que estos no están disponibles en la plataforma. La organización describe un ecosistema más amplio llamado LumynaX Core, que sería el motor de inteligencia principal, pero este release concreto es anterior a esa implementación y no incluye el pipeline completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), maori (mi) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | safetensors (segun tags), aunque el repositorio tiene 0.0 GB |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, el numero de parametros, la composicion del dataset de entrenamiento ni el proceso de alineacion (RLHF, DPO, etc.). La model card indica que es un modelo "nativo LumynaX", es decir, no se basa en pesos de modelos open source externos, pero no aporta detalles tecnicos adicionales. Al ser un release legacy, es probable que la documentacion tecnica completa se haya perdido o no se haya publicado. No hay informacion sobre innovaciones tecnicas como atencion lineal, decodificacion especulativa o mecanismos MoE en este modelo concreto.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation, por lo que el modelo puede producir texto en ingles y maori, aunque no se especifican capacidades concretas.
- No hay informacion sobre razonamiento, generacion de codigo, matematicas, tool calling, agentes o capacidades multimodales.
- El soporte multilingue se limita a los dos idiomas indicados en los metadatos (en, mi), sin detalles sobre el grado de competencia en cada uno.
- No se menciona ningun modo especial de pensamiento, vision o audio.

## Casos de uso

Dado el estado del modelo (legacy, sin pesos publicados, sin especificaciones), los casos de uso realistas se limitan al ambito de la investigacion y la reproducibilidad:

- Reproduccion de experimentos historicos: el modelo puede servir para verificar resultados de investigacion previa del laboratorio AbteeX AI Labs, siempre que se puedan obtener los artefactos necesarios.
- Estudio de la evolucion de la familia LumynaX: comparar este seed con releases posteriores para entender como ha cambiado la arquitectura y el enfoque de entrenamiento.
- Auditoria de trazabilidad: la model card menciona archivos como `checksums.sha256` y `release_export_manifest.json`, que permiten verificar la integridad y el origen de los artefactos.
- Investigacion sobre IA soberana: el modelo es un ejemplo de un enfoque local-first desarrollado en Nueva Zelanda, util para estudiar iniciativas de soberania digital en IA.
- Pruebas de compatibilidad con transformers: si se logran obtener los pesos, se podria evaluar su funcionamiento con la libreria transformers, aunque el repositorio vacio dificulta esta tarea.
- Documentacion de practicas de publicacion: el repositorio y la model card sirven como caso de estudio sobre como un laboratorio publica y retira modelos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. El modelo no debe compararse con otros en terminos de rendimiento, ya que no se ha medido ni documentado.

## Requisitos de hardware

No se dispone de informacion sobre requisitos de hardware. Al no haber pesos publicados ni especificaciones de parametros, no es posible estimar VRAM, GPUs recomendadas ni opciones de despliegue. El repositorio tiene 0.0 GB, por lo que no hay artefactos que ejecutar. No se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama u otras herramientas de inferencia.

## Comparativa con modelos similares

No disponible. Este modelo no tiene especificaciones publicadas que permitan compararlo con alternativas de la misma categoria. Existe un repositorio relacionado llamado `Aimaghsoodi/lumynax-tiny-qwen25-05b-gguf` que parece ser una variante basada en Qwen2.5 0.5B, pero es un modelo distinto y no se puede establecer una comparacion directa con el artefacto legacy aqui documentado.

## Limitaciones y advertencias

- Modelo legacy y desactualizado: la propia model card lo califica como "outdated" y "no recomendado para produccion".
- Repositorio sin pesos: el tamano de 0.0 GB indica que no hay artefactos descargables, lo que impide su uso practico.
- Licencia "other": no se especifican los terminos exactos, lo que genera incertidumbre sobre el uso comercial y la redistribucion.
- Sin documentacion tecnica: no hay informacion sobre arquitectura, entrenamiento, sesgos o alucinaciones.
- Riesgo de confusion: el nombre "LumynaX" puede llevar a confundirlo con el sistema LumynaX Core actual, que es un proyecto mucho mas amplio y con capacidades diferentes.
- Idiomas limitados: solo se declaran ingles y maori, sin garantias de calidad en otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbteeXAILab/lumynax-tiny
- Organizacion AbteeX AI Labs: https://huggingface.co/AbteeXAILab/models
- Repositorio fuente (GitHub): https://github.com/Aimaghsoodi/lumynax-tiny
- Sitio web de AbteeX AI Labs: https://abteex.com
- Sitio web de LumynaX: https://lumynax.com
- Repositorio relacionado (variante GGUF de Qwen2.5 0.5B): https://github.com/Aimaghsoodi/lumynax-tiny-qwen25-05b-gguf
- Monorepo de releases LumynaX: https://github.com/Aimaghsoodi/lumynax-release
