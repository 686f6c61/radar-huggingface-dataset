# johnlockejrr/regnetx-8gf-polyline-baseline-stage0

## Resumen

`regnetx-8gf-polyline-baseline-stage0` es un modelo de detección de objetos especializado en la detección de líneas de base (baselines) en documentos históricos manuscritos. Desarrollado por johnlockejrr, forma parte del ecosistema `regnetx-det` y predice líneas de texto como polilíneas definidas por puntos de control B-spline cúbicos, en lugar de las cajas delimitadoras tradicionales. Esta aproximación resulta especialmente adecuada para manuscritos con líneas curvas o inclinadas, habituales en documentos antiguos.

El modelo combina un backbone RegNetX-8GF preentrenado en ImageNet-1K V2, un cuello D-FINE HybridEncoder y un decodificador PolylineTransformer con 300 consultas. Con aproximadamente 54,1 millones de parámetros, procesa imágenes a una resolución de 1280×1280 píxeles y exporta los resultados a formatos PAGE-XML o ALTO-XML. Se presenta como un checkpoint de preentrenamiento genérico (Stage-0) pensado para servir de punto de partida para fine-tuning en dominios específicos, como escrituras hebreas, samaritanas o siríacas.

Su relevancia radica en que aborda un problema concreto de la digitalización patrimonial: la detección fiable de líneas de base en manuscritos multilingües. El modelo mejora al profesor D-FINE Stage-0 en la misma partición de validación (F1 de 0,929 frente a 0,893), lo que demuestra la eficacia de la arquitectura RegNetX + HybridEncoder para esta tarea.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RegNetXPolylineModel: RegNetX-8GF (backbone) → D-FINE HybridEncoder (neck) → PolylineTransformer (decoder) |
| Parametros totales | ~54,1 M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible (solo safetensors en precisión original) |
| Idiomas soportados | en, la, de, he, hbo, smp, sam, fr, fi, el, is, syc, syr, sv, ar, chu |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (archivo `best_cbad_f1.safetensors`, ~208 MB) |

## Arquitectura y entrenamiento

La arquitectura sigue un diseño de tres etapas. El backbone es un RegNetX-8GF (`regnetx_080.tv2_in1k`) preentrenado en ImageNet-1K V2, que extrae características en tres escalas (C3, C4, C5). El cuello es un D-FINE HybridEncoder con `hidden_dim=256` y strides 8/16/32, que fusiona las pirámides de características. El decodificador es un PolylineTransformer con 300 consultas que predice, para cada línea de texto, K=8 puntos de control B-spline cúbicos más un valor de altura. La detección se formula como predicción de conjuntos de polilíneas puntuadas; el entorno poligonal (BLLA) se aplica solo en el momento de serializar a PAGE/ALTO.

El entrenamiento (Stage-0) utilizó 46 511 páginas de entrenamiento y 1 923 de validación (holdout del 5%, seed 42), compiladas a partir de 29 corpora abiertos y privados de escrituras históricas multilingües, normalizados a B-splines cúbicos uniformes con K=8. La receta incluye optimizador AdamW con LR base de 1×10⁻⁴ (backbone a 0,2×), calentamiento lineal de 2 épocas seguido de decaimiento coseno, precisión mixta bf16, batch efectivo de 32, y un máximo de 80 épocas con early stopping basado en `cbad_f1_max` (paciencia 12, mínimo 15). Se aplicó aumento de datos fotométrico suave y rotación de ±2°, descartando líneas fuera de los límites. La distancia de emparejamiento fue de 20 píxeles sobre el canvas de 1280. El entrenamiento se realizó en una AMD Instinct MI300X en AMD Developer Cloud con ROCm 7.14.

Una innovación destacable es la transferencia de pesos desde el modelo D-FINE Stage-0: se cargaron los pesos del encoder y decodificador con coincidencia de formas, manteniendo los pesos específicos de RegNetX en `input_proj.*.conv.weight`. Esto permitió arrancar desde un punto ya optimizado para la tarea.

## Capacidades

- Detección de líneas de base (baselines) en documentos históricos manuscritos, representadas como polilíneas B-spline con 8 puntos de control por línea.
- Exportación directa a formatos PAGE-XML y ALTO-XML, estándares en digitalización patrimonial.
- Soporte multilingüe para 17 idiomas, incluyendo escrituras semíticas (hebreo, samaritano, siríaco, arameo) y lenguas europeas históricas (latín, alemán, francés, finés, islandés, sueco, griego, etc.).
- Funciona como checkpoint de preentrenamiento genérico para fine-tuning en dominios específicos (por ejemplo, hebreo/samaritano, ICDAR cBAD Stage-1).
- Capacidad de probing zero-shot en manuscritos heterogéneos, aunque con degradación esperada por el dominio.
- No realiza reconocimiento de texto (transcripción), ni detección de regiones de layout (párrafos, tablas, ilustraciones).

## Casos de uso

- Digitalización de manuscritos históricos: el modelo detecta líneas de base en páginas escaneadas y exporta los resultados a PAGE-XML, listos para integrarse en flujos de transcripción colaborativa como Transkribus o eScriptorium.
- Preprocesamiento para OCR de documentos antiguos: al proporcionar líneas de base precisas, facilita el recorte y la normalización de líneas individuales antes de la etapa de reconocimiento óptico de caracteres.
- Fine-tuning para dominios específicos: investigadores pueden partir de este checkpoint Stage-0 y ajustarlo con un corpus propio de una escritura concreta (por ejemplo, samaritano o siríaco) con pocos cientos de páginas anotadas.
- Investigación comparativa de arquitecturas: permite comparar el rendimiento de RegNetX + HybridEncoder frente a D-FINE o ConvNeXt en la tarea de detección de líneas de base, gracias a su naturaleza de baseline reproducible.
- Generación de datos de entrenamiento: las predicciones del modelo pueden usarse para preanotar grandes colecciones de documentos, reduciendo el esfuerzo humano de anotación en proyectos de digitalización masiva.
- Evaluación de calidad en colecciones patrimoniales: bibliotecas y archivos pueden usar el modelo para auditar automáticamente la calidad de las líneas de base existentes en sus metadatos ALTO, detectando errores de segmentación.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor en la model card, sobre la partición de validación interna multiscript (holdout del 5%, seed 42). No son resultados oficiales del test de ICDAR cBAD 2019.

| Metrica | Valor |
|---|---|
| cbad_f1_max (conf sweep) | 0,929 |
| cbad_f1 @ conf=0,4 | 0,929 |
| Precision @ conf=0,4 (mejor época) | 0,930 |
| Recall @ conf=0,4 (mejor época) | 0,929 |
| cbad_f1 @ conf=0,1 (registrado, no recomendado) | 0,751 |

Comparativa con checkpoints hermanos en la misma partición de validación:

| Modelo | cbad_f1_max |
|---|---|
| regnetx-8gf-polyline-baseline-stage0 (este) | 0,929 |
| dfine-det-large-baseline-stage0 (profesor D-FINE) | 0,893 |
| regnetx-8gf-polyline-hebrew-samaritan (fine-tune dominio) | 0,942 (validación interna) |

La métrica cbad_f1 es una F1 estilo cBAD que empareja polilíneas densificadas mediante coste de Chamfer bidireccional medio, considerando un verdadero positivo si el coste es ≤ 20 píxeles. El punto de operación recomendado es confianza 0,4; el valor a confianza 0,1 se registró pero no debe usarse como referencia de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con ~54,1 M de parámetros y un archivo de pesos de ~208 MB, la inferencia en fp32 requiere aproximadamente 220 MB de VRAM solo para los pesos, más la activación de la imagen a 1280×1280. Cualquier GPU con 4 GB o más es suficiente.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA RTX 3060 o superior, AMD RX 6000/7000) para inferencia. El entrenamiento se realizó en una AMD Instinct MI300X (64 GB HBM3) con ROCm 7.14.
- Cabe en GPU consumer: sí, sin problema. Incluso en GPUs integradas con suficiente memoria compartida podría ejecutarse, aunque con menor rendimiento.
- Opciones de despliegue: el repositorio `regnetx-det` en GitHub proporciona la implementación de referencia en PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de visión, no de lenguaje.
- Latencia y throughput: no disponible. Depende de la GPU y de la resolución de entrada; al ser un modelo de ~54 M de parámetros, se espera una inferencia de decenas de milisegundos por imagen en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento (cbad_f1_max) | Licencia |
|---|---|---|---|---|---|
| regnetx-8gf-polyline-baseline-stage0 (este) | RegNetX-8GF + HybridEncoder + PolylineTransformer | ~54,1 M | 1280×1280 | 0,929 | Apache-2.0 |
| dfine-det-large-baseline-stage0 (profesor) | D-FINE (backbone ConvNeXt o similar) + HybridEncoder | no disponible | 1280×1280 | 0,893 | Apache-2.0 |
| regnetx-8gf-polyline-hebrew-samaritan | RegNetX-8GF + HybridEncoder + PolylineTransformer | ~54,1 M | 1280×1280 | 0,942 (val interna) | Apache-2.0 |

No se dispone de información sobre otros modelos comparables de detección de líneas de base en documentos históricos en la información proporcionada. Los tres modelos listados comparten la misma tarea y partición de validación, lo que permite una comparación directa. El fine-tune hebreo/samaritano supera al baseline genérico, como es esperable al estar especializado en un dominio concreto.

## Limitaciones y advertencias

- El modelo es un preentrenamiento Stage-0 genérico; su rendimiento en dominios muy alejados de los corpora de entrenamiento puede degradarse significativamente (domain gap).
- Las puntuaciones de validación son internas (holdout multiscript) y no deben interpretarse como resultados oficiales de ICDAR cBAD 2019. Las páginas de cBAD están incluidas en la mezcla de preentrenamiento, por lo que cualquier comparación con el test oficial requiere un fine-tune Stage-1 separado.
- No realiza reconocimiento de texto (transcripción). Solo detecta líneas de base; la etapa de OCR debe realizarse con otro modelo.
- No detecta regiones de layout (párrafos, tablas, ilustraciones). Su salida se limita a líneas de texto.
- El punto de operación recomendado es confianza 0,4. Usar confianza 0,1 produce una F1 mucho menor (0,751) y no debe emplearse como referencia de calidad.
- El modelo se entrenó principalmente con escrituras históricas europeas y semíticas; su rendimiento en escrituras de otras regiones (asiáticas, africanas, americanas) no está garantizado.
- La licencia Apache-2.0 permite uso comercial, pero los corpora de entrenamiento incluyen conjuntos privados; el autor no detalla la procedencia exacta de todos los datos, por lo que se recomienda verificar los derechos de uso de los datos en caso de aplicaciones comerciales.
- No se han publicado resultados de benchmarks en la información disponible más allá de los declarados por el autor en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/johnlockejrr/regnetx-8gf-polyline-baseline-stage0
- Repositorio del ecosistema `regnetx-det`: https://github.com/johnlockejrr/regnetx-det
- Checkpoint hermano (fine-tune hebreo/samaritano): https://huggingface.co/johnlockejrr/regnetx-8gf-polyline-hebrew-samaritan
- Checkpoint profesor D-FINE Stage-0: https://huggingface.co/johnlockejrr/dfine-det-large-baseline-stage0
- Paper de referencia (D-FINE, arxiv:2410.13842): https://arxiv.org/abs/2410.13842
- Documentación de RegNetX en Torchvision: https://docs.pytorch.org/vision/main/models/regnet.html
