# EduardoHYM/citeverify-laya-s1

# citeverify-laya-s1

## Resumen

citeverify-laya-s1 es un clasificador de texto en portugues de Brasil ajustado a partir de `convaiinnovations/laya-multilingual` (mmBERT-base, unos 322 M de parametros, Apache-2.0, revision `e4e9ddf21a7b1903b7acffd8814ad4307bf63a67`). Resuelve una tarea muy concreta: dada una frase de una pieza procesal brasilena, decidir si invoca alguna fuente del derecho como fundamento y, en caso afirmativo, si la identifica (clase A: proceso con numero, sumula, tema, articulo de ley, tribunal/ano/relator) o si es una referencia vaga (clase B: "a jurisprudencia pacifica desta Corte", "o dispositivo legal de regencia"); la clase C corresponde a frases que no invocan ninguna fuente.

El modelo es la capa neural opcional ("Sistema 1") de citeverify, la solucion presentada por su autor al desafio Jusbrasil x BRACIS 2026. Es importante subrayar que no decide si una citacion es real o inventada: esa verificacion corresponde a una consulta exacta contra una base congelada. Este modelo solo senala frases con referencia vaga o incompleta, y el span se delimita despues con una regla deterministica.

Es relevante ahora porque demuestra un patron util para el sector legal: separar el triaje neural (deteccion de referencias vagas o no identificadas) de la verificacion simbolica o por recuperacion. Con 322 M de parametros, licencia Apache-2.0 y ejecucion en CPU a 110-180 ms por frase, es un componente ligero que se puede insertar en pipelines de revision documental sin GPU. El repositorio publica solo pesos safetensors (1,3 GB, fp32), sin tarjeta de contexto ni datos de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (mmBERT-base), ajustado como clasificador de secuencia |
| Parametros totales | 321.908.998 (~322 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en safetensors fp32) |
| Idiomas soportados | Portugues, variante de Brasil (pt-BR); el modelo base es multilingue, pero el ajuste se hizo unicamente en pt |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano de repo 1,3 GB) |

Otros datos de interes: pipeline declarado `text-classification`, autor `EduardoHYM`, creado el 2026-09-30 y actualizado el 2026-10-01, con 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La base es mmBERT-base, un encoder transformer bidireccional multilingue de aproximadamente 322 M de parametros. El ajuste se realizo con el script oficial del framework Laya (`research/scripts/finetune_single_device.py`, variante RLCD, commit `6d942c9` del repositorio `NandhaKishorM/laya`): 2 epocas, semilla 0, ejecucion en CPU y alrededor de una hora de entrenamiento. La temperatura se ajusto en una particion separada, quedando en 1,0 para el formato de eleccion. El prompt de la tarea (instruccion y criterios A/B/C) debe reproducirse exactamente como se uso en el entrenamiento.

Los datos de la version 2 suman 3.600 frases: 2.400 (840 de clase A, 600 de clase B y 960 de clase C) procedentes de documentos sinteticos de estres derivados de la muestra de desarrollo de la competicion, con las etiquetas de los gabaritos, mas 1.200 frases de un banco escrito a mano mediante `scripts/laya_extra.py` (moldes y frases vagas disjuntos respecto al conjunto adversarial de evaluacion, e incorporando negativos dificiles). Los datos derivados de la competicion no se publican. No hay indicios de RLHF ni DPO; la innovacion metodologica reseñable es el uso del marco Laya con ajuste RLCD y la separacion entre clasificacion de triaje y verificacion exacta.

## Capacidades

- Clasificacion de frases juridicas en tres clases: A (fuente identificada), B (invocacion vaga) y C (sin invocacion), con probabilidades por clase.
- Deteccion de referencias vagas: jurisprudencia, precedentes, sumulas o ley citados sin identificacion concreta.
- Reconocimiento de citas identificables: proceso o recurso con numero, sumula, tema, articulo de ley, o julgado con tribunal, ano o relator.
- Salida probabilistica calibrada (probabilidades por clase y suma P(A)+P(B) como P(cita)), apta para aplicar umbrales.
- Inferencia en CPU con latencia de 110-180 ms por frase en fp32 y comportamiento determinista (probabilidades identicas en dos pasadas).
- Procesamiento por lotes (el ejemplo de la model card usa `batch_size=16`).
- Capacidades multilingues: no evaluadas en el ajuste; el modelo se entreno y evaluo solo en portugues de Brasil.
- No cubre generacion de texto, razonamiento general, codigo, matematicas, vision ni audio; no implementa tool calling ni comportamiento agentico multi-paso. Es un clasificador de secuencia, no un modelo generativo.

## Casos de uso

- Triaje previo a la verificacion exacta de citas: en un pipeline juridico, cada frase de una pieza procesal se etiqueta como A, B o C; las frases B se derivan a revision y las A pasan a la consulta exacta contra la base congelada de citas. Es el flujo para el que se diseno el modelo.
- Control de calidad de borradores en despachos: detectar parrafos que invocan "jurisprudencia pacifica" o "el dispositivo legal de regencia" sin identificarlos, que son justamente los que mas riesgo de fundamentacion generica o de alucinacion presentan.
- Filtro en pipelines de redaccion con LLM: cuando un modelo generativo produce memoriales o contrarrazones sinteticas, este clasificador actua como capa de control que marca referencias vagas antes de que el documento salga del sistema.
- Preetiquetado de corpus juridicos: clasificar A/B/C de forma masiva para acelerar la anotacion humana en proyectos de etiquetado de jurisprudencia o doctrina.
- Auditoria y muestreo de expedientes: preclasificar lotes de documentos por densidad de referencias vagas para priorizar la revision manual de los casos mas problematicos.
- Filtrado de ruido en recuperacion (RAG juridico): marcar consultas o fragmentos con referencias no verificables y evitar que entren como contexto en un sistema de respuesta.
- Investigacion sobre calibracion en dominios legales: el modelo reporta ECE por debajo de 0,021 incluso en el conjunto adversarial, lo que lo hace util como referencia para estudiar calibracion en clasificacion juridica.

## Benchmarks y rendimiento

Evaluacion sobre una muestra estratificada de 2.099 frases; P(cita) = P(A) + P(B) con umbral 0,5. La columna "v1" recoge los valores de la version anterior alli donde la model card los compara.

| Metrica | Zero-shot (base) | Ajustado: dev* | Ajustado: ruido pesado* | Ajustado: adversarial (inedito) |
|---|---|---|---|---|
| Acurácia 3 clases | 0,25 | 1,000 | 1,000 | 0,979 (v1: 0,915) |
| Precision de "cita" | 0,47 | 1,000 | 1,000 | 0,997 (v1: 0,989) |
| Recall de "cita" | 0,94 | 1,000 | 1,000 | 0,972 (v1: 0,904) |
| ECE (15 franjas) | 0,26 | 0,000 | 0,001 | 0,021 (v1: 0,072) |

\* Cuerpos de frase vistos durante el entrenamiento, por lo que los valores son optimistas. El conjunto adversarial emplea moldes y frases vagas ineditos.

Datos adicionales de rendimiento aportados en la model card:

| Aspecto | Valor |
|---|---|
| Latencia por frase (CPU, fp32) | ~110-180 ms |
| Determinismo | Probabilidades identicas en dos pasadas |
| Rendimiento en pipeline (v2) | 77-113 frases vagas ineditas recuperadas por conjunto adversarial de 104 documentos (v1: 53-68), sin falsos positivos |
| Impacto en conjuntos con moldes de desarrollo | Sin cambios respecto a la version anterior |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (calculada a partir de 322 M de parametros): ~1,3 GB en fp32, ~0,65 GB en fp16 y ~0,33 GB en int8, mas el coste de activaciones segun el tamano de lote.
- GPU: cabe sin problema en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en iGPU con memoria compartida. No requiere A100 ni H100.
- Inferencia en CPU: viable y verificada por el autor; 110-180 ms por frase en fp32. Es el escenario de despliegue documentado (el ejemplo de la model card usa `device="cpu"`).
- Opciones de despliegue: libreria Laya (`laya==0.3.22`, `torch 2.14`, `transformers 5.17` segun la model card) con `laya.load(...)`; tambien es exportable a otros runtimes de clasificacion (ONNX, etc.), aunque no se documenta ninguna conversion oficial.
- Throughput: no se publica una cifra de frases por segundo; el unico dato es la latencia por frase y el uso de `batch_size=16` en el ejemplo.
- El repositorio pesa 1,3 GB en safetensors fp32; en fp16 o int8 el almacenamiento y la memoria se reducen aproximadamente a la mitad y a un cuarto, respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| citeverify-laya-s1 | ~322 M | no disponible | Acurácia 3 clases 0,979 en adversarial | Apache-2.0 | HuggingFace (0 descargas) |
| convaiinnovations/laya-multilingual (base, zero-shot) | ~322 M | no disponible | Acurácia 3 clases 0,25 en zero-shot | Apache-2.0 | HuggingFace |
| XLM-RoBERTa-base (encoder multilingue generico) | ~278 M | 512 | no disponible (sin evaluacion publicada en esta tarea) | MIT | HuggingFace |
| mDeBERTa-v3-base (encoder multilingue generico) | ~278 M | 512 | no disponible (sin evaluacion publicada en esta tarea) | MIT | HuggingFace |

No existe una comparacion head-to-head publicada entre citeverify-laya-s1 y otros clasificadores de citas juridicas en portugues. Los encoders genericos de tamano equivalente se incluyen como alternativas de sustrato, pero sus prestaciones en esta tarea concreta no se han medido en la informacion disponible.

## Limitaciones y advertencias

- Entrenado unicamente con el estilo del generador de la competicion (pareceres, memoriales y contrarrazones sinteticos); no se ha evaluado sobre piezas procesales reales, por lo que su comportamiento fuera de esa distribucion es desconocido.
- No debe usarse para decidir si una citacion existe o es inventada; esa decision corresponde a la consulta exacta contra una base congelada. El modelo solo clasifica si la frase invoca una fuente y si la identifica.
- Riesgo de sobreajuste a los moldes de entrenamiento: los conjuntos de desarrollo dan 1,000 de acurácia, un valor optimista que no se traslada necesariamente a documentos reales.
- Solo portugues de Brasil. El modelo base es multilingue, pero el ajuste se hizo exclusivamente en pt-BR y no hay evaluacion en otros idiomas.
- La pregunta y los criterios A/B/C deben introducirse exactamente como en el entrenamiento; modificar la instruccion puede degradar las predicciones.
- Sin capacidades generativas, de razonamiento general ni de tool calling; es un clasificador de secuencia que trabaja a nivel de frase y no modela el documento completo.
- Calibracion ligeramente peor fuera de distribucion: el ECE pasa de 0,000 en datos vistos a 0,021 en el conjunto adversarial.
- Los datos derivados de la competicion no se publican, lo que dificulta reproducir exactamente el ajuste.
- Licencia Apache-2.0, que permite uso comercial, pero sin garantias y con la advertencia de que el autor no ha validado el modelo en produccion real.
- Modelo muy reciente y sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta.
- No hay informacion publicada sobre longitud de contexto ni sobre cuantizaciones soportadas.

## Enlaces

- HuggingFace: https://huggingface.co/EduardoHYM/citeverify-laya-s1
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Repositorio de la solucion citeverify (desafio Jusbrasil x BRACIS 2026): https://github.com/EduardoHernany/bracis
- Repositorio del framework Laya: https://github.com/NandhaKishorM/laya
