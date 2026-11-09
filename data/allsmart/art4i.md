# allsmart/Art4i

## Resumen

ALLSmartArt4i es un modelo de clasificación de tokens (token classification) especializado en detectar identificadores indirectos de personas en textos en alemán e inglés, es decir, descripciones que sin contener un nombre permiten singularizar a un individuo ("el alcalde de Neukirchen", "la única matrona del pueblo"). Lo desarrolla ALLSmart (allsmartllm.com) como parte de una familia de tres modelos de privacidad, junto con ALLSmartArt4 (nombres, organizaciones y direcciones) y ALLSmartArt9-10 (categorías especiales de datos). El modelo resuelve un problema concreto del cumplimiento del RGPD: el artículo 4(1) considera dato personal cualquier información que permita identificar a una persona, no solo su nombre, y la mayoría de los sistemas de anonimización se limitan a reconocer entidades nombradas.

Técnicamente es un fine-tuning de `jhu-clsp/mmBERT-base` con 307.531.009 parámetros totales, orientado a clasificación de tokens y empaquetado en `safetensors` para su uso con la librería `transformers`. Su salida es, por palabra, la probabilidad de pertenecer a un identificador indirecto, y el post-procesado de producción agrupa esas probabilidades en pasajes completos que se sustituyen en bloque. Según la model card, sustituye en producción a la comprobación que hacía un modelo de lenguaje de 35B en el nivel más estricto de la capa de privacidad de ALLSmartLLM, lo que da una idea de su relación coste/rendimiento.

Su relevancia actual es doble: por un lado, cubre un hueco que los reconocedores de entidades clásicos dejan abierto (descripciones de rol, cadenas de atributos, referencias a sucursales o empleadores); por otro, su tamaño de 0,3B y su latencia de decenas de milisegundos en CPU lo hacen desplegable en local dentro de pipelines de anonimización sin depender de GPUs ni de APIs externas. La licencia Apache 2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), fine-tuning de `jhu-clsp/mmBERT-base` para token classification |
| Parametros totales | 307.531.009 (≈0,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card describe ventanas de 250 palabras con paso 200 para textos largos) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache 2.0 (modelo base mmBERT-base bajo MIT) |
| Formato de pesos | safetensors (repo de 1,3 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT (la familia a la que pertenece mmBERT-base) adaptado a clasificación de tokens con una cabeza por palabra que emite la probabilidad de que esa palabra forme parte de un identificador indirecto. No es un modelo generativo ni un MoE: es un clasificador discriminativo que etiqueta secuencias y cuyo post-procesado (`beispiel.py` en el repositorio) convierte las probabilidades por palabra en pasajes contiguos que se sustituyen en bloque. El post-procesado aplica ventanas de 250 palabras con paso 200 y toma el máximo por palabra, conserva el artículo inicial fuera de la máscara para mantener la gramaticalidad de la frase y descarta palabras sueltas en minúscula, que según la model card eran la principal fuente de falsos positivos.

Los datos de entrenamiento son exclusivamente textos inventados en alemán e inglés, creados para este propósito, sin datos de clientes ni datos personales reales. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO (no aplicables a un clasificador de este tipo). La evaluación se realizó sobre conjuntos ciegos anotados de forma independiente al entrenamiento y nunca usados para entrenamiento ni selección de modelo, lo que refuerza la validez de las métricas reportadas.

## Capacidades

- Detección de identificadores indirectos de personas: descripciones de rol ("el alcalde de Neukirchen"), profesiones únicas en un lugar ("la única matrona del pueblo"), combinaciones de atributos ("la nueva compañera de la sucursal de Graz que antes trabajaba en Siemens").
- Clasificación a nivel de palabra con salida de probabilidad (`indirekt`), pensada para integrarse en un pipeline de sustitución de pasajes completos.
- Procesamiento de textos largos mediante ventanas deslizantes de 250 palabras con paso 200 y agregación por máximo.
- Preservación de la gramaticalidad: el artículo inicial queda fuera de la máscara ("dem <<INDIRECT_1>>").
- Filtrado de falsos positivos: descarte de palabras sueltas en minúscula que no singularizan a nadie.
- Uso complementario con un reconocedor de nombres: los roles pegados a un nombre ("Werksleiter Huber") se dejan al reconocedor de nombres.
- Idiomas: alemán e inglés.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un clasificador de tokens, no un modelo generativo.

## Casos de uso

- Anonimización previa al envío a LLMs de terceros: el modelo marca pasajes como "el alcalde de Neukirchen am Walde" antes de que el texto salga de la infraestructura propia, cumpliendo con el artículo 4(1) del RGPD, con latencias de ≈25 ms para 30 palabras y ≈90 ms para 250 palabras en CPU de escritorio (Ryzen 7 7800X3D, 8 hilos).
- Cumplimiento del RGPD en documentos internos: procesamiento de actas, correos y expedientes de recursos humanos para detectar descripciones que singularizan a empleados sin nombrarlos, sustituyéndolas por marcadores genéricos.
- Pipeline de publicación de datos abiertos: revisión de textos antes de su publicación para eliminar identificadores indirectos (roles, sucursales, empleadores anteriores) que, combinados, reidentifican a personas en conjuntos pequeños.
- Preprocesado en sistemas de atención al cliente: anonimización de transcripciones y tickets antes de almacenarlos o analizarlos, con despliegue en CPU dentro del propio backend.
- Capa de privacidad en asistentes corporativos: integración como primer filtro en la capa de privacidad de un asistente LLM, sustituyendo comprobaciones más costosas con un modelo de 35B, tal como describe el autor en producción.
- Auditoría de datasets y corpus: etiquetado masivo de corpus en alemán e inglés para medir la densidad de identificadores indirectos antes de usarlos en entrenamiento o análisis.
- Herramienta de revisión para equipos legales y de protección de datos: marcado asistido de pasajes sospechosos en contratos, informes y comunicaciones para revisión humana posterior.

## Benchmarks y rendimiento

Datos de evaluación publicados en la model card, sobre conjuntos ciegos anotados de forma independiente al entrenamiento:

| Conjunto | Composición | Pasajes encontrados | Precisión | Textos inocuos modificados |
|---|---|---|---|---|
| Conjunto ciego 1 | 300 textos (168 con persona), 250 alemán / 50 inglés | 96,7 % (183) | 97,3 % | 4 / 132 |
| Conjunto ciego 2 | 240 textos (128 con persona), 146 alemán / 94 inglés, un tercio largos | 86,8 % (174) | 92,0 % | 5 / 112 |
| Documentos largos | 40 documentos de 700 a 2.800 palabras, 69 pasajes anotados, muchas cadenas entre párrafos | 40,6 % | 80,6 % | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; no aplican a un clasificador de tokens de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,3B parámetros, los pesos en `safetensors` ocupan aproximadamente 1,2 GB en fp32; en fp16 rondarían los 0,6 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; cualquier GPU con 2 GB o más de VRAM es suficiente. Una RTX 4090 o una A100 están sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU con suficiente memoria compartida.
- Despliegue: `transformers` con PyTorch es la vía natural; también es compatible con `endpoints_compatible` según los tags de Hugging Face. Para CPU, el autor reporta latencias de ≈25 ms para 30 palabras y ≈90 ms para 250 palabras en un Ryzen 7 7800X3D con 8 hilos.
- Latencia y throughput: los datos de la model card corresponden a CPU de escritorio; no se han publicado cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Tarea | Licencia |
|---|---|---|---|---|---|
| ALLSmartArt4i | 0,3B | no disponible | de, en | Identificadores indirectos (token classification) | Apache 2.0 |
| ALLSmartArt4 | no disponible | no disponible | no disponible | Nombres, organizaciones y direcciones | no disponible |
| ALLSmartArt9-10 | no disponible | no disponible | no disponible | Categorías especiales de datos | no disponible |

Los dos modelos comparables son del mismo autor y forman la familia de privacidad de ALLSmartLLM; la model card no ofrece sus especificaciones detalladas. No se dispone de información sobre alternativas de terceros con la misma tarea específica (detección de identificadores indirectos) en la información proporcionada.

## Limitaciones y advertencias

- Cadenas de atributos dispersos: la debilidad conocida del modelo son las descripciones repartidas en varias frases o párrafos ("la nueva compañera … de Graz … que antes trabajaba en …"). En el conjunto ciego 2 encuentra 11 de 24 y en documentos largos menos de la mitad (40,6 % de pasajes, precisión 80,6 %). Cada atributo por separado no identifica a nadie; solo la combinación lo hace.
- Referencias retrospectivas: las alusiones a una persona ya descrita ("el vecino") no se marcan a propósito, porque enmascarar la primera descripción se considera suficiente.
- Cobertura lingüística limitada: entrenado y medido solo en alemán e inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Riesgo de falsos positivos en textos inocuos: 4 de 132 y 5 de 112 textos sin persona fueron modificados en los conjuntos ciegos 1 y 2 respectivamente.
- No es un modelo generativo: no razona, no responde preguntas ni soporta tool calling; su uso requiere un pipeline de post-procesado (el `beispiel.py` del repositorio) para producir sustituciones.
- Dependencia de un reconocedor de nombres complementario: los roles pegados a un nombre ("Werksleiter Huber") se delegan al reconocedor de nombres, por lo que el sistema completo necesita ambos componentes.
- Datos de entrenamiento sintéticos: no se ha validado con datos reales de clientes, lo que puede introducir un sesgo de distribución respecto a textos reales.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base mmBERT-base está bajo MIT, cuyos términos deben respetarse igualmente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción externa ni de validación independiente de las métricas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allsmart/Art4i
- Modelo complementario ALLSmartArt4: https://huggingface.co/allsmart/Art4
- Modelo complementario ALLSmartArt9-10: https://huggingface.co/allsmart/Art9-10
- Sitio del proyecto ALLSmartLLM: https://allsmartllm.com
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
