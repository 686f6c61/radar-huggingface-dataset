# gmxn/BioMedGPT-R1

## Resumen

BioMedGPT-R1-17B es un modelo multimodal de razonamiento biomedico publicado conjuntamente por PharMolix y el Institute of AI Industry Research (AIR). Se trata de la evolucion del linaje BioMedGPT, que actualiza su componente linguistico al modelo DeepSeek-R1-Distill-Qwen-14B, incorporando asi capacidad de razonamiento explicito (estilo cadena de pensamiento) sobre un backbone de 14B parametros procedente de Qwen. El modelo resultante se distribuye bajo la denominacion de 17B, lo que sugiere la incorporacion de un codificador visual adicional que eleva el computo total de parametros.

El modelo aborda un problema concreto: el razonamiento multimodal en el dominio biomedico, es decir, la capacidad de responder preguntas que combinan texto clinico o cientifico con imagenes (moleculas, imagenes medicas, diagramas). Su entrenamiento se articula en dos etapas: una primera de alineamiento cross-modal y una segunda de SFT multimodal orientada al razonamiento. El autor afirma que su rendimiento en benchmarks de QA biomedico esta a la par de modelos comerciales, aunque no se aportan cifras concretas en la informacion disponible.

La relevancia actual del modelo radica en la escasez de modelos abiertos especializados en razonamiento biomedico multimodal con capacidades de tipo R1. No obstante, la informacion publica es muy limitada: la model card no documenta licencia, idiomas, composicion del dataset ni resultados numericos de benchmarks, lo que condiciona seriamente su evaluacion para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone linguistico DeepSeek-R1-Distill-Qwen-14B + modulo de alineamiento cross-modal) |
| Parametros totales | 17B (denominacion del modelo); el backbone linguistico es de 14B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (se distribuye en chunks que deben fusionarse con `model_merge.py`) |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Qwen-14B como componente linguistico, un modelo denso de 14B parametros derivado de Qwen y destilado a partir de DeepSeek-R1, lo que le confiere capacidad de generar razonamiento explicito antes de la respuesta. Sobre este backbone se anade un modulo multimodal (presumiblemente un codificador visual con proyector de alineamiento, aunque el tipo concreto no se especifica en la informacion disponible) que eleva el total a 17B parametros.

El entrenamiento se realiza en dos etapas segun la model card: primero un alineamiento cross-modal y despues un SFT multimodal orientado al razonamiento. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO adicionales. Tampoco se detalla si se aplicaron innovaciones como decodificacion especulativa o mecanismos de atencion lineal. La publicacion de pesos en formato de chunks que requieren fusion manual con `model_merge.py` es un detalle operativo relevante para el despliegue.

## Capacidades

- Razonamiento multimodal biomedico: responde preguntas que combinan texto e imagenes del dominio (moleculas, imagenes medicas, graficos cientificos).
- Razonamiento explicito tipo cadena de pensamiento, heredado de la destilacion de DeepSeek-R1.
- Generacion de texto tecnico y cientifico en el ambito biomedico.
- Integracion con la plataforma OpenBioMed para exploracion de QA biomedico (ejemplo en `examples/biomedgpt_r1.ipynb`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque la naturaleza R1 del backbone sugiere razonamiento en pasos; no confirmado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales adicionales (audio, thinking mode explicito): no disponible.

## Casos de uso

- Preguntas y respuestas sobre literatura biomedica: el modelo puede procesar articulos o fragmentos con figuras y responder consultas que requieren interpretar tablas, diagramas o imagenes experimentales, aprovechando su alineamiento cross-modal.
- Analisis de imagenes moleculares: dado que el modelo es multimodal en el dominio biomedico, se puede emplear para describir o razonar sobre representaciones de moleculas y estructuras quimicas en tareas de investigacion preclinica.
- Asistencia en interpretacion de imagenes medicas: como apoyo a la revision de estudios de imagen, generando descripciones y razonamientos que el profesional puede validar (siempre con supervision humana).
- Educacion y formacion biomedica: generacion de explicaciones razonadas paso a paso sobre conceptos de fisiologia, farmacologia o diagnostico, utiles en plataformas de aprendizaje.
- Investigacion en razonamiento multimodal: como base para experimentos academicos sobre cadenas de razonamiento en dominios cientificos, gracias a su naturaleza R1 y a la disponibilidad de pesos abiertos (sujeto a la licencia no documentada).
- Prototipado con OpenBioMed: integracion en la plataforma OpenBioMed para construir demos de QA biomedico y evaluar el modelo frente a otros del ecosistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo esta "a la par con modelos comerciales en benchmarks de QA biomedico", pero no se aportan cifras, nombres de benchmarks ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 17B parametros: en FP16 se requeririan aproximadamente 34 GB de VRAM; en cuantizacion de 8 bits, unos 17-18 GB; en 4 bits, unos 9-10 GB. Estas cifras son estimaciones genericas y no estan confirmadas por el autor.
- GPU recomendadas: no disponible. Para FP16 se necesitarian GPU de 40 GB o mas (A100 40GB/80GB, H100). Para cuantizaciones de 8 bits, GPU de 24 GB (RTX 4090, A10G) podrian ser suficientes.
- Cabe en consumer GPU: previsiblemente en RTX 3090/4090 (24 GB) con cuantizacion de 8 bits o inferior; no confirmado.
- Opciones de despliegue: no documentadas oficialmente. El autor proporciona `model_merge.py` para fusionar los chunks y un ejemplo en OpenBioMed; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioMedGPT-R1-17B | 17B (backbone 14B) | no disponible | Multimodal biomedico | no disponible | Pesos en HF (chunks) |
| BioMedGPT (version previa) | no disponible | no disponible | Multimodal biomedico | no disponible | Pesos en HF |
| DeepSeek-R1-Distill-Qwen-14B | 14B | no disponible en esta ficha | Solo texto | MIT (segun publicacion original de DeepSeek) | Pesos en HF |

La comparacion con alternativas especializadas en biomedicina multimodal abierta es limitada porque la informacion disponible no permite verificar rendimiento ni licencia. El modelo base DeepSeek-R1-Distill-Qwen-14B es la referencia mas directa para el componente linguistico, pero carece de capacidades multimodales.

## Limitaciones y advertencias

- Ausencia total de informacion sobre licencia: no se puede confirmar si el uso comercial esta permitido, lo que impide recomendarlo para produccion sin aclaracion previa del autor.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; en un dominio clinico esto es un riesgo critico.
- Riesgo de alucinacion elevado en un modelo de razonamiento biomedico sin validacion clinica: no debe usarse como sustituto del criterio medico.
- Idiomas soportados no especificados; se desconoce si el modelo funciona correctamente en castellano.
- Longitud de contexto no documentada, lo que dificulta planificar casos de uso con documentos largos.
- Composicion del dataset de entrenamiento no publicada, impidiendo evaluar cobertura y posibles sesgos de dominio.
- Formato de pesos en chunks que requiere fusion manual: anade complejidad operativa y riesgo de error en el despliegue.
- Sin resultados numericos de benchmarks: la afirmacion de paridad con modelos comerciales no es verificable.
- Modelo sin descargas ni likes en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/gmxn/BioMedGPT-R1
- Wisemodel (espejo de pesos): https://wisemodel.cn/models/PharMolix/BioMedGPT-R1
- Repositorio OpenBioMed: https://github.com/PharMolix/OpenBioMed
- Paper de referencia (BioMedGPT): Luo et al., "BioMedGPT: An open multimodal large language model for biomedicine", IEEE Journal of Biomedical and Health Informatics, 2024.
