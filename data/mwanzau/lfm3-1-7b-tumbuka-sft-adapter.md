# Mwanzau/LFM3-1.7B-Tumbuka-SFT-Adapter

## Resumen

El repositorio `Mwanzau/LFM3-1.7B-Tumbuka-SFT-Adapter` es un adaptador de ajuste fino supervisado (SFT) publicado en Hugging Face por el usuario Mwanzau. Por la nomenclatura del identificador, se trata de un adaptador destinado a un modelo base de la familia LFM3 de Liquid AI con aproximadamente 1.700 millones de parametros, especializado en el idioma tumbuka (tambien conocido como chiTumbuka), una lengua bantú hablada principalmente en Malawi, Zambia y Tanzania. El repositorio contiene unicamente los pesos del adaptador (0,1 GB), no el modelo base completo.

La model card esta generada automaticamente y no aporta informacion sustantiva: no documenta el procedimiento de entrenamiento, el dataset utilizado, los hiperparametros, la licencia ni los resultados de evaluacion. Tampoco se especifica la tecnica de adaptacion concreta (LoRA, QLoRA, adaptador lineal u otra), aunque el tamano del repositorio es coherente con un adaptador de bajo rango sobre un modelo de 1,7B.

El interes de esta ficha es limitado para produccion: se trata de un artefacto de investigacion temprana, sin descargas ni validacion externa, orientado a la adaptacion linguistica de un modelo pequeno a una lengua de bajos recursos. Es relevante como ejemplo del ecosistema de adaptadores para lenguas africanas, pero no como componente listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SFT sobre modelo base LFM3 (arquitectura del base no disponible en la informacion) |
| Parametros totales | No disponible (adaptador de ~0,1 GB; el base se infiere de 1,7B por el nombre) |
| Parametros activos | No aplica (no se indica que el base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Tumbuka (inferido del nombre); no confirmado en la model card |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador); el base no se distribuye en este repo |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base mas alla de lo que sugiere el identificador (LFM3, familia de Liquid AI, ~1,7B parametros). El repositorio contiene exclusivamente un adaptador de ajuste fino supervisado, por lo que la arquitectura efectiva en inferencia es la del modelo base con el adaptador acoplado. No se especifica si el adaptador es LoRA, QLoRA, un modulo lineal o de otra naturaleza.

La model card no documenta el dataset de entrenamiento, el numero de tokens, la composicion linguistica, la existencia de RLHF/DPO ni los hiperparametros. Tampoco se indica el modelo base exacto (version, checkpoint o revision), lo que impide reproducir el ajuste. La unica referencia tecnica presente es la cita al calculador de impacto de ML (Lacoste et al., 2019), que no aporta informacion sobre el entrenamiento real.

## Capacidades

- Generacion de texto en tumbuka: el proposito declarado por el nombre es la adaptacion linguistica a esta lengua bantú.
- Ajuste supervisado: se espera que el adaptador mejore el comportamiento del base en tareas de instruccion en tumbuka, aunque no hay evaluacion que lo confirme.
- Herencia de capacidades del base LFM3: al no documentarse, no es posible confirmar razonamiento, codigo, matematicas, vision, tool calling ni modo thinking.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; solo se infiere tumbuka por el nombre.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en lenguas de bajos recursos: el adaptador sirve como punto de partida para experimentos de adaptacion del tumbuka en pipelines academicos, siempre que se documente el base y el dataset.
- Prototipos de traduccion tumbuka-ingles: combinado con el base LFM3, podria emplearse para generar borradores de traduccion en entornos de investigacion, con revision humana obligatoria.
- Generacion de contenido educativo en tumbuka: elaboracion asistida de material didactico para escuelas de Malawi o Zambia, sujeto a validacion por hablantes nativos.
- Chatbots de atencion ciudadana en tumbuka: prototipos de bajo coste para servicios publicos locales, con limitaciones por la falta de evaluacion y de licencia clara.
- Fine-tuning incremental: el adaptador puede servir como inicializacion para nuevos ajustes SFT sobre tumbuka en lugar de partir de cero.
- Benchmarking de adaptadores linguisticos: util como referencia en estudios comparativos de tecnicas de adaptacion (LoRA frente a ajuste completo) sobre modelos de ~1,7B.
- Preservacion linguistica: generacion de corpus sinteticos en tumbuka para documentacion y estudio, con supervision editorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion; como referencia orientativa, un modelo base de ~1,7B en FP16 requiere del orden de 3,4 GB solo para pesos, mas overhead de activaciones y KV cache, pero este dato no procede de la model card.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamano del base seria plausible en GPUs con 8 GB o mas en cuantizacion de 8 bits, pero no hay dato oficial.
- Opciones de despliegue: el repo declara `transformers` y `endpoints_compatible`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa con otros adaptadores para lenguas bantú o con modelos base de tamano similar.

## Limitaciones y advertencias

- Model card generada automaticamente: no documenta entrenamiento, datos, hiperparametros ni evaluacion; la trazabilidad es practicamente nula.
- Licencia no especificada: no es posible determinar si el uso comercial esta permitido; debe consultarse al autor antes de cualquier despliegue productivo.
- Modelo base no identificado con exactitud: sin la revision concreta del base LFM3, el adaptador puede no cargar o comportarse de forma distinta a la esperada.
- Riesgo de alucinacion: no evaluado; en lenguas de bajos recursos el riesgo suele ser elevado por escasez de datos de entrenamiento.
- Sesgos: no documentados; los sesgos del base y del corpus tumbuka utilizado (si existe) se desconocen.
- Cobertura idiomatica: no confirmada; el tumbuka tiene variantes dialectales y no se indica cual se cubre.
- Sin descargas ni validacion externa: no hay evidencia de uso real ni de calidad del adaptador.
- Repositorio de 0,1 GB: coherente con un adaptador, no con un modelo completo; no debe tratarse como un modelo autonomo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mwanzau/LFM3-1.7B-Tumbuka-SFT-Adapter
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculador de impacto de ML: https://mlco2.github.io/impact#compute
