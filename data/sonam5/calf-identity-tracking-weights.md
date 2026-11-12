# Sonam5/Calf-Identity-Tracking-Weights

## Resumen

Calf Identity Tracking Weights es un conjunto de dos modelos de vision por computador entrenados para el seguimiento e identificacion individual de terneros en entornos de ganaderia de precision. Lo desarrolla Sonam5 (Haiyu Yang) y resuelve un problema concreto: mantener la identidad de cada animal a lo largo de varios dias en grabaciones de camara fija, reasignando la identidad correcta a cada ternero al inicio de cada jornada. Los pesos acompanan al proyecto Re-id-for-tracking, que sigue a cuatro terneros durante una semana.

El paquete incluye dos piezas: un backbone TinyViT de 40,66 millones de parametros que sustituye al backbone de imagen de SAM 3 dentro de su tracker de video, destilado a partir de las caracteristicas de SAM 3, y un detector RF-DETR-Seg Small a 624 px con una unica clase (`calf`) que localiza a los animales al inicio del dia y reinicia el tracker cuando se pierde una identidad. Ambos se entrenaron exclusivamente sobre dos dias de grabacion (18 y 19 de abril de 2024) de una camara de la granja FarmA_R1.

Es relevante por su enfoque de destilacion hacia despliegue en el borde: reduce el coste computacional de SAM 3 manteniendo su semantica de caracteristicas, y publica pesos, mascaras y dataset de forma abierta para investigacion en monitorizacion animal longitudinal. No es un modelo de lenguaje ni un modelo generativo: es infraestructura de vision especifica de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos: backbone TinyViT (destilado de SAM 3) para el tracker de video; detector RF-DETR-Seg Small para segmentacion de instancias |
| Parametros totales | 40,66 M (backbone del tracker); detector: no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de imagen/video a 624 px en el detector) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de vision) |
| Licencia | SAM License (license_name: sam-license) |
| Formato de pesos | `.pt` (tracker, pickle) y `.pth` (detector, pickle); hashes en `CHECKSUMS.sha256` |

## Arquitectura y entrenamiento

El tracker es un estudiante TinyViT que sustituye el backbone de imagen de SAM 3 dentro de su tracker de video. La inicializacion del tronco parte de `timm/tiny_vit_21m_512.dist_in22k_ft_in1k` y se destila contra las caracteristicas de SAM 3 sobre los dos dias de entrenamiento, cubriendo condiciones de dia y de noche. El detector es RF-DETR-Seg Small a resolucion 624 px con una sola clase, entrenado sobre mascaras generadas por SAM 3. El pipeline completo mantiene detecciones con confianza superior a 0,35 y aplica una limpieza posterior descrita en `detector/detector.json`.

Los datos de entrenamiento provienen de la camara FarmA_R1 del Calf Play Behavior Dataset, unicamente los dias 18 y 19 de abril de 2024. La semana de test (22 a 28 de abril) no se uso en entrenamiento. El video de entrenamiento es CC0 1.0. No se detalla en la informacion disponible el numero de tokens, frames ni la composicion exacta del dataset, ni si hubo fases de RLHF/DPO (no aplicables a este tipo de modelo). La innovacion destacable es la destilacion de SAM 3 hacia un backbone ligero apto para despliegue en el borde, manteniendo la compatibilidad con el tracker original.

## Capacidades

- Seguimiento multiobjeto de terneros en video de camara fija.
- Re-identificacion de individuos al inicio de cada jornada (reasignacion de identidad).
- Deteccion y segmentacion de instancias de la clase `calf` a 624 px.
- Reinicio del tracker cuando se pierde una identidad, apoyado en el detector.
- Funcionamiento en condiciones de dia y noche (el estudiante se destilo sobre ambos regimenes).
- Extraccion de mascaras por individuo para analisis longitudinal.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual y de dominio especifico.

## Casos de uso

- Monitorizacion longitudinal de comportamiento: el pipeline mantiene la identidad de cada ternero a lo largo de una semana, lo que permite agregar metricas de actividad, juego o descanso por animal en lugar de por deteccion anonima.
- Analisis de comportamiento de juego: combinado con el Calf Play Behavior Dataset, permite atribuir episodios de juego a individuos concretos y estudiar su evolucion temporal.
- Investigacion en ganaderia de precision: seguimiento de cohortes pequenas en corrales experimentales para estudiar interacciones sociales y jerarquias.
- Validacion de pipelines de re-identificacion: sirve como referencia reproducible (pesos, mascaras y dataset publicos) para comparar metodos de tracking con re-id en escenarios reales de granja.
- Despliegue en el borde: el backbone de 40,66 M parametros reduce el coste frente a SAM 3 completo, lo que facilita ejecutar el tracker en hardware limitado cercano a la camara.
- Deteccion y re-siembra del tracker: el detector RF-DETR-Seg puede usarse de forma independiente para localizar terneros al inicio del dia o tras oclusiones prolongadas.
- Analisis visual retrospectivo: generacion de mascaras por individuo para revision manual o para alimentar analiticas posteriores sobre grabaciones archivadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El backbone de 40,66 M parametros es ligero, pero el tracker requiere ademas los pesos de SAM 3 de Meta, cuyo consumo no se detalla.
- GPU recomendadas: no disponible. El ejemplo de carga usa `device="cuda"` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el diseno orientado al borde sugiere que el backbone es ligero, pero no se aportan medidas.
- Opciones de despliegue: carga via `bench_core.load_student` del repositorio FarmSAM para el tracker y via `rfdetr==1.10.1` (`from_checkpoint`) para el detector. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Calf Identity Tracking (este) | 40,66 M (backbone) | imagen/video a 624 px (detector) | Tracking y re-id de terneros | SAM License | Pesos en Hugging Face |
| SAM 3 (Meta) | no disponible | no disponible | Segmentacion y tracking general | SAM License (acceso con gate) | `facebook/sam3` |
| RF-DETR-Seg Small | no disponible | 624 px | Deteccion/segmentacion de instancias | Apache-2.0 | Libreria `rfdetr` |
| TinyViT 21M (timm) | ~21 M | no aplica | Backbone de vision | no disponible en la informacion | `timm` |

La comparativa es limitada: SAM 3 y RF-DETR son componentes base, no alternativas equivalentes de dominio. No se dispone de datos de rendimiento comparativo entre este modelo y otros sistemas de re-identificacion de ganado.

## Limitaciones y advertencias

- Entrenado sobre un unico corral, una unica camara y cuatro terneros blancos y negros; la generalizacion a otros corrales, camaras o pelajes no esta validada.
- El autor recomienda comprobar el modelo en el propio corral antes de confiar en el.
- No destinado al seguimiento de personas ni a decisiones sobre animales individuales sin revision humana.
- Riesgo de perdida de identidad y de confusion entre individuos similares; el propio diseno incluye reinicio del tracker por esta razon.
- Licencia SAM License: impone limites de control de uso y obliga a que las publicaciones que usen los modelos citen SAM 3 (clausula 1.b.ii). Cualquier redistribucion debe hacerse bajo esos terminos e incluir `LICENSE_SAM.txt`.
- Los ficheros `.pt` y `.pth` son pickle; deben verificarse los SHA-256 antes de cargarlos por riesgo de ejecucion de codigo.
- El detector no almacena la resolucion en el fichero: hay que pasar 624 px explicitamente.
- El tracker requiere los pesos de SAM 3 de Meta bajo el gate de `facebook/sam3`, lo que anade una dependencia externa y condiciones de acceso.
- No se aportan datos de sesgo, alucinacion (no aplica) ni rendimiento cuantitativo; la evaluacion queda pendiente de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/Sonam5/Calf-Identity-Tracking-Weights
- Repositorio del proyecto: https://github.com/Sonam525/Re-id-for-tracking
- Pagina del proyecto: https://sonam525.github.io/Re-id-for-tracking/
- Repositorio FarmSAM: https://github.com/Sonam525/FarmSAM
- Dataset de mascaras: https://huggingface.co/datasets/Sonam5/Calf-Identity-Tracking-Masks
- Dataset de comportamiento: https://huggingface.co/datasets/Sonam5/Calf-Play-Behavior-Dataset
- Pesos en FarmSAM: https://huggingface.co/Sonam5/FarmSAM
- Licencia SAM: https://huggingface.co/Sonam5/Calf-Identity-Tracking-Weights/blob/main/LICENSE_SAM.txt
- Preprint de destilacion: https://arxiv.org/abs/2604.27128
- SAM 3 (Meta): https://huggingface.co/facebook/sam3
