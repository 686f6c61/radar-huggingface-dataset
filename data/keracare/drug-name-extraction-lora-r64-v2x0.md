# KeraCare/drug-name-extraction-lora-r64-v2x0

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) de PEFT, no un modelo completo. Se trata de un adaptador extraído mediante descomposición en valores singulares (SVD) a partir de la diferencia entre el modelo ajustado `KeraCare/drug_name_extraction_v2x0` y su modelo base `zai-org/GLM-OCR`, fijando el rango en 64 (alpha 64, escalado 1.0). El autor es KeraCare y su finalidad declarada es la extracción de nombres de fármacos, presumiblemente a partir de texto procesado por el modelo base de OCR.

El adaptador se distribuye en formato `safetensors` bajo la librería `peft` y ocupa aproximadamente 0,1 GB. Afecta a 220 módulos del modelo base, entre ellos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `gate_up_proj`, `qkv` y `proj`. La reconstrucción es explícitamente lossy: el error medio de reconstrucción es del 10,70 % y el peor caso alcanza el 26,04 %, según indica la propia model card.

Su relevancia es limitada y muy específica: sirve para reutilizar un ajuste fino de extracción de fármacos sobre GLM-OCR sin necesidad de redistribuir los pesos completos del modelo ajustado, pero con una pérdida de fidelidad reconocida por el autor. No hay información pública sobre licencia, idiomas soportados ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base `zai-org/GLM-OCR`; arquitectura interna del base no disponible |
| Parametros totales | No disponible (adaptador de ~0,1 GB; rank 64, alpha 64, scaling 1.0) |
| Parametros activos | No aplica (no es MoE); no disponible para el modelo base |
| Longitud de contexto | No disponible (depende del modelo base `zai-org/GLM-OCR`) |
| Tipos de cuantizacion | No disponible; los pesos del adaptador se distribuyen en `safetensors` |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA) |
| Autor | KeraCare |
| Modelo base | `zai-org/GLM-OCR` |
| Modelo de origen del adaptador | `KeraCare/drug_name_extraction_v2x0` |
| Metodo de extraccion | SVD a rango 64 de la diferencia origen − base |
| Modulos afectados | 220 (`down_proj`, `gate_proj`, `gate_up_proj`, `k_proj`, `o_proj`, `proj`, `q_proj`, `qkv`, `up_proj`, `v_proj`) |
| Error de reconstruccion | Medio 10,70 %; peor caso 26,04 % (fidelidad lossy) |
| Tamano del repo | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 con alpha 64 y escalado 1.0, aplicado sobre 220 matrices de proyeccion del modelo base `zai-org/GLM-OCR`. No se ha entrenado desde cero: se ha recuperado por SVD de la resta entre los pesos del ajuste fino `KeraCare/drug_name_extraction_v2x0` y los pesos del modelo base. Los modulos objetivo cubren proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `qkv`), proyecciones de las capas MLP (`gate_proj`, `up_proj`, `down_proj`, `gate_up_proj`) y una proyeccion adicional (`proj`).

No se dispone de informacion sobre el numero de tokens de entrenamiento del ajuste original, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o similares. La propia model card advierte que la delta no era puramente de rango 64, por lo que la reconstruccion es lossy: el error medio es del 10,70 % y el peor caso del 26,04 %. Esto implica que el adaptador no reproduce exactamente el comportamiento del ajuste original y que su calidad debe verificarse antes de usarlo en produccion. No se documentan innovaciones tecnicas adicionales mas alla del propio procedimiento de extraccion por SVD.

## Capacidades

- Extraccion de nombres de farmacos: es la tarea declarada del ajuste del que deriva el adaptador.
- Procesamiento de texto procedente de OCR: hereda del modelo base `zai-org/GLM-OCR` la capacidad de tratar entradas derivadas de reconocimiento optico de caracteres, aunque no se detallan sus caracteristicas exactas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se especifican idiomas).
- Capacidades especiales (vision, audio, modo thinking): no disponibles; dependen del modelo base, del que no se aportan especificaciones.

## Casos de uso

- Extraccion de farmacos en historiales clinicos digitalizados: el adaptador se aplicaria sobre GLM-OCR para localizar y extraer nombres de medicamentos a partir de texto reconocido en documentos medicos, aprovechando el ajuste especifico de la tarea.
- Procesamiento de recetas y ordenes medicas: integrado en un pipeline de OCR, permitiria estructurar los farmacos prescritos en un formato explotable por sistemas de gestion farmaceutica.
- Farmacovigilancia: deteccion automatica de principios activos citados en informes de reacciones adversas para su posterior normalizacion y analisis.
- Enriquecimiento de bases de datos clinicas: extraccion de nombres de farmacos desde notas libres para poblar campos estructurados en sistemas de historia clinica electronica.
- Investigacion farmacoepidemiologica: preprocesado de grandes volumenes de texto medico para identificar exposicion a farmacos en estudios observacionales.
- Verificacion de fidelidad de adaptadores extraidos: caso de uso meta, util para comparar el adaptador recuperado por SVD frente al ajuste original `KeraCare/drug_name_extraction_v2x0` y cuantificar el impacto del error de reconstruccion.
- Despliegue ligero de ajustes especificos: al pesar ~0,1 GB, permite distribuir la especializacion de extraccion de farmacos sin redistribuir el modelo base completo, siempre que la perdida de fidelidad sea aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa ~0,1 GB, por lo que su huella de almacenamiento es despreciable; el requisito real de VRAM lo determina el modelo base `zai-org/GLM-OCR`.
- VRAM estimada para inferencia: no disponible, ya que depende del tamano y la cuantizacion del modelo base, datos no proporcionados.
- GPU recomendadas: no disponible por la misma razon.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base.
- Opciones de despliegue: al ser un adaptador PEFT en `safetensors`, es cargable con las librerias `peft` y `transformers`; el soporte en servidores como vLLM, TGI, llama.cpp u Ollama dependera del modelo base y de la compatibilidad de estos con adaptadores LoRA.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `KeraCare/drug-name-extraction-lora-r64-v2x0` | Adaptador LoRA extraido por SVD | Rank 64 sobre 220 modulos; ~0,1 GB | No disponible | No disponible | Publico en HuggingFace, 0 descargas |
| `KeraCare/drug_name_extraction_v2x0` | Ajuste fino completo (origen) | No disponible | No disponible | No disponible | Publico en HuggingFace |
| `zai-org/GLM-OCR` | Modelo base | No disponible | No disponible | No disponible | Publico en HuggingFace |

No se dispone de datos de rendimiento que permitan comparar el adaptador con alternativas de la misma categoria (otros extractores de nombres de farmacos o LoRA de extraccion de entidades).

## Limitaciones y advertencias

- Fidelidad lossy reconocida por el autor: error de reconstruccion medio del 10,70 % y peor caso del 26,04 %, por lo que puede no reproducir con exactitud el comportamiento del ajuste original.
- Prohibicion practica de asumir equivalencia con `KeraCare/drug_name_extraction_v2x0`: la propia model card recomienda verificar la calidad antes de su uso.
- Licencia no especificada: se desconoce si permite uso comercial, lo que supone un riesgo legal para despliegues en produccion.
- Idiomas no documentados: se ignora si el ajuste cubre castellano, ingles u otros idiomas, algo critico para tareas clinicas multilingues.
- Ausencia total de evaluacion: 0 descargas y 0 likes, sin benchmarks ni metricas publicadas que respalden su calidad.
- Riesgo de alucinacion inherente a los modelos generativos: en extraccion de farmacos, un falso positivo puede tener consecuencias relevantes en entornos clinicos.
- Dependencia estricta del modelo base `zai-org/GLM-OCR`: el adaptador no es funcional por si solo.
- Ambito muy estrecho: disenado para extraccion de nombres de farmacos, no para tareas generales de generacion, razonamiento o codigo.
- Ausencia de informacion sobre sesgos: no se documentan sesgos conocidos ni evaluaciones de equidad, algo especialmente sensible en datos sanitarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KeraCare/drug-name-extraction-lora-r64-v2x0
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
- Modelo de origen del ajuste: https://huggingface.co/KeraCare/drug_name_extraction_v2x0
- Repositorio PEFT: https://github.com/huggingface/peft
