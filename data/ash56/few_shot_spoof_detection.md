# ash56/few_shot_spoof_detection

## Resumen

Few-shot spoof detection es un conjunto de checkpoints y manifiestos de datos publicado por Ashi Garg (usuario `ash56`) que acompaña al articulo *Rapidly Adapting to New Voice Spoofing: Few-Shot Detection of Synthesized Speech Under Distribution Shifts* (ASRU 2025). No es un modelo generativo, sino un paquete de detectores de voz sintetica (anti-spoofing) disenados para adaptarse rapidamente a nuevos ataques de clonacion de voz con muy pocas muestras etiquetadas.

El repositorio incluye tres familias de detectores: redes prototipicas few-shot (variantes binaria y multiclase, con agregacion por atencion o por media), clasificadores SSL-AASIST en regimen zero-shot y una linea base one-class basada en distancia de Mahalanobis. Todos ellos usan el frontend auto-supervisado XLS-R 300M como extractor de representaciones, que debe descargarse por separado.

Su relevancia actual radica en el problema que aborda: los sistemas de deteccion de deepfakes de audio sufren una degradacion severa cuando aparecen nuevos sintetizadores no vistos en entrenamiento. Este trabajo propone evaluar la capacidad de adaptacion bajo cambios de distribucion (distribution shifts) con tamanos de soporte de 5 y 10 muestras, un escenario realista en produccion donde no hay tiempo ni datos para reentrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes prototipicas few-shot sobre frontend XLS-R 300M; clasificadores SSL-AASIST; baseline one-class Mahalanobis |
| Parametros totales | no disponible (depende del checkpoint; el frontend XLS-R aporta 300M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (evaluacion multilingue en ShiftySpeech, idiomas concretos no detallados) |
| Licencia | other (terminos no especificados en la model card) |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

El sistema se apoya en XLS-R 300M como extractor de caracteristicas acusticas auto-supervisado. Sobre esas representaciones se construyen cabezas de clasificacion de tres tipos: redes prototipicas few-shot que calculan prototipos por clase a partir de un conjunto de soporte (support set) y clasifican consultas por proximidad, con dos variantes de agregacion (atencion auto-atentiva y media simple); clasificadores SSL-AASIST que operan en regimen zero-shot sin adaptacion; y un detector one-class basado en distancia de Mahalanobis que modela la distribucion de audio genuino.

La innovacion principal es el paradigma de evaluacion: en lugar de medir rendimiento en un test i.i.d., se mide la capacidad de adaptacion a nuevos ataques de spoofing con 5 o 10 muestras de soporte y multiples iteraciones (por defecto 100) con semilla fija. El conjunto de evaluacion ShiftySpeech introduce cambios de distribucion deliberados (por ejemplo, ataques tipo APNet2 en japones) para simular escenarios de dominio no visto.

## Capacidades

- Deteccion binaria de audio genuino frente a audio sintetico (spoofing).
- Clasificacion multiclase de distintos tipos de ataque de sintesis de voz.
- Aprendizaje few-shot: adaptacion a nuevos ataques con 5 o 10 muestras etiquetadas.
- Evaluacion zero-shot mediante SSL-AASIST sin adaptacion al dominio objetivo.
- Deteccion one-class basada en modelado de la clase genuina (Mahalanobis).
- Evaluacion reproducible con semillas fijas y multiples iteraciones de muestreo del support set.
- Soporte de evaluacion multilingue a traves de los manifiestos de ShiftySpeech.
- No incluye generacion de texto, tool calling, agentes ni capacidades multimodales mas alla del audio.

## Casos de uso

- Verificacion anti-spoofing en sistemas de autenticacion por voz: el detector few-shot permite incorporar rapidamente muestras de un nuevo ataque detectado en produccion (5-10 clips) y recalibrar los prototipos sin reentrenar el frontend XLS-R.
- Moderacion de contenido en plataformas de audio: clasificacion binaria de clips subidos para marcar posibles voces sinteticas antes de su publicacion, usando el checkpoint `binary_attn_5shot` como filtro de primera linea.
- Monitorizacion de campanas de desinformacion con voz clonada: el modo multiclase permite distinguir familias de sintetizadores y rastrear que herramienta se esta empleando en una campana concreta.
- Investigacion en robustness de sistemas anti-spoofing: el paquete de manifiestos y scripts de evaluacion (`src/evaluate.py`, `src/zero_shot.py`, `src/mahalanobis.py`) sirve como banco de pruebas reproducible para comparar metodos bajo distribution shift.
- Deteccion de fraude en call centers: integracion del detector one-class Mahalanobis como capa de alerta cuando no se dispone de ejemplos etiquetados de ataques, modelando unicamente la distribucion de voces genuinas.
- Auditoria de datasets de voz: cribado de corpus de entrenamiento para identificar muestras sinteticas infiltradas antes de usarlos en el entrenamiento de modelos ASR o TTS.
- Evaluacion comparativa de frontends SSL: los checkpoints permiten medir como distintos backbones (aqui XLS-R 300M) afectan a la capacidad de adaptacion few-shot en tareas de anti-spoofing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo arXiv:2508.13320 y al repositorio de GitHub para las tablas de resultados; no se incluyen cifras de EER, accuracy ni metricas comparativas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 6.4 GB, pero un unico checkpoint mas el frontend XLS-R 300M (aproximadamente 1.2 GB en fp32) cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM deberia ser suficiente para inferencia de un checkpoint individual; los ejemplos de la model card usan `--device cuda:0` sin especificar modelo de GPU.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060/4060 y superiores, dado el tamano del frontend y las cabezas de clasificacion.
- Opciones de despliegue: scripts Python propios del repositorio (`src/evaluate.py`, `src/zero_shot.py`, `src/mahalanobis.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Frontend | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| few-shot spoof detection (este) | Detector anti-spoofing | XLS-R 300M | Few-shot prototypical + zero-shot + one-class | other | HuggingFace + GitHub |
| AASIST | Detector anti-spoofing | Raw waveform / grafos | Entrenamiento supervisado clasico | no disponible en esta ficha | Codigo publico |
| SSL-AASIST | Detector anti-spoofing | Wav2Vec2 / XLS-R | Supervisado con frontend SSL | no disponible en esta ficha | Codigo publico |
| Wav2Vec2-based anti-spoofing | Detector anti-spoofing | Wav2Vec2 | Fine-tuning supervisado | no disponible en esta ficha | Multiples repos |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para cuantificar diferencias frente a estas alternativas.

## Limitaciones y advertencias

- El repositorio no redistribuye el frontend XLS-R 300M ni el audio de evaluacion; es necesario descargarlos por separado siguiendo el README de GitHub, lo que anade friccion al despliegue.
- La licencia es `other` sin terminos detallados en la model card: es imprescindible revisar el repositorio de GitHub y el articulo antes de cualquier uso comercial.
- No se documentan sesgos conocidos, tasas de alucinacion (no aplica en sentido estricto a un clasificador) ni limitaciones de idioma mas alla de la evaluacion multilingue en ShiftySpeech.
- El rendimiento depende criticamente de la calidad y representatividad del support set few-shot; con 5 muestras, la varianza entre iteraciones puede ser alta.
- El modelo esta disenado para deteccion de voz sintetica, no para verificación de locutor ni para tareas ASR; usarlo fuera de ese ambito no esta validado.
- No hay garantia de robustez frente a ataques adversariales disenados especificamente contra el detector.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopcion ni validacion independiente por parte de la comunidad.
- La fecha de creacion indicada (2026-11-01) es posterior a la fecha del articulo (ASRU 2025); conviene verificar la integridad y vigencia del repositorio antes de usarlo en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/ash56/few_shot_spoof_detection
- GitHub del proyecto: https://github.com/Ashigarg123/fewshot-spoof-detection
- Articulo arXiv: https://arxiv.org/abs/2508.13320
- Referencia del congreso: ASRU 2025 (IEEE Automatic Speech Recognition and Understanding Workshop)
