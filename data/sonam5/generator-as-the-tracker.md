# Sonam5/Generator-as-the-tracker

## Resumen

Los checkpoints "Generator as the tracker" son adaptadores LoRA de contexto (IC-LoRA) para el modelo de vídeo LTX-2.3 de Lightricks, publicados por Sonam5 (autores Haiyu Yang y Miel Hostens). El adaptador transforma un clip RGB en un clip de mapas de identidad (ID-map): cada persona recibe un color plano y distinto que se mantiene estable a lo largo del tiempo, de modo que el propio generador de vídeo actúa como tracker de múltiples objetos sin detector, modelo de movimiento ni paso de asociación separados.

El modelo base es LTX-2.3 22B dev, un generador de vídeo de gran tamaño; el adaptador se aplica únicamente sobre el flujo de vídeo (atención QKV y proyecciones de salida, además de las proyecciones feed-forward), dejando intacto el flujo de audio. Los LoRA son de rango 32 con alpha 32 y se distribuyen en cuatro ficheros safetensors, dos por cada dataset de seguimiento (DanceTrack y SportsMOT), correspondientes a distintas fases de entrenamiento.

La relevancia del trabajo es metodológica: propone el seguimiento de identidades como una tarea de generación vídeo-a-vídeo en la que los colores persistentes generados son las propias trayectorias. El repositorio es pequeño (1,3 GB) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32, alpha 32) sobre el transformer de vídeo LTX-2.3 22B dev; flujo de audio sin modificar |
| Parámetros totales | no disponible (adaptadores LoRA; el modelo base es de 22B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventanas de generación de 49 fotogramas con stride 40 y prefijo de 9 fotogramas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | LTX-2 Community License Agreement (derivados de LTX-2.3); entrenado con DanceTrack y SportsMOT, restringido a investigación no comercial |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los adaptadores se insertan en el modelo de vídeo LTX-2.3 22B dev (`ltx-2.3-22b-dev.safetensors`), concretamente en la atención del flujo de vídeo (QKV y proyección de salida) y en las proyecciones feed-forward. Cada fichero es un LoRA de rango 32 con alpha 32, en el formato del entrenador LTX-2 (IC-LoRA). El flujo de audio del modelo base no se modifica.

El entrenamiento se organiza en dos fases por dataset. La fase A es de traducción únicamente y la fase B es de continuación con entrenamiento de prefijo; los checkpoints se seleccionaron por IoU de primer plano en validación cada 500 pasos (DanceTrack) o 750 pasos (SportsMOT). Las etiquetas de silueta se generaron con SAM 3. El seguimiento se realiza encadenando ventanas de 49 fotogramas con stride 40 y un prefijo de 9 fotogramas tomado de la cola limpia de la ventana anterior; la paleta de colores generada se decodifica con el códec del repositorio (`core/gentrack`), donde el índice de paleta es el identificador de trayectoria.

## Capacidades

- Conversión de vídeo RGB a vídeo de mapas de identidad (ID-map) con colores planos y persistentes por persona.
- Seguimiento de múltiples objetos sin detector, modelo de movimiento ni asociación externos: el color generado es la trayectoria.
- Encadenamiento de ventanas para procesar vídeos completos (49 fotogramas por ventana, stride 40, prefijo de 9 fotogramas).
- Re-adquisición de identidades tras oclusiones, según los experimentos del paper.
- Variantes especializadas por dominio: DanceTrack (baile) y SportsMOT (deportes).
- Decodificación de trayectorias mediante el códec del repositorio, con el índice de paleta como track id.
- No se documentan capacidades de tool calling, agentes, multilingüismo ni audio en la información disponible.

## Casos de uso

- Seguimiento de bailarines en vídeo: usar el checkpoint `dancetrack_phaseB_continuation_step2500.safetensors` encadenando ventanas para obtener trayectorias de identidad estables en secuencias de danza con movimiento rápido y oclusiones.
- Análisis deportivo: aplicar la variante de SportsMOT para seguir jugadores en retransmisiones y extraer trayectorias por identidad a partir de los colores generados.
- Investigación en tracking generativo: reproducir los controles factoriales del paper (celdas A, B, C y D) con los checkpoints de fase A y fase B para aislar el efecto de la continuación con prefijo.
- Re-adquisición tras oclusión: emplear el checkpoint de fase B en escenarios donde una persona desaparece y reaparece, aprovechando el prefijo de 9 fotogramas de la ventana anterior.
- Generación de datos sintéticos de tracking: producir mapas de identidad a partir de clips RGB para aumentar datasets de seguimiento con etiquetas densas.
- Evaluación de modelos de vídeo como trackers: integrar el pipeline `ltx_run_chain.py` y `ltx_chain.py` en experimentos que comparen el tracking implícito del generador con pipelines clásicos.
- Prototipado en investigación de visión por computador: usar los adaptadores como componente de un estudio sobre identidades persistentes en vídeo, siempre en ámbito no comercial.

## Benchmarks y rendimiento

| Benchmark / métrica | Resultado | Notas |
|---|---|---|
| DanceTrack test (HOTA) | 40,3 | Entrada al test-server con el tracker encadenado (checkpoint fase B, paso 2.500) |
| DanceTrack test (DetA) | 37,6 | La detección es el punto débil, especialmente en aglomeraciones |
| Velocidad end-to-end | ~0,4 fotogramas por segundo | Medido en una A100 |
| SportsMOT validation | no disponible en cifras | Resultados reportados en el paper con el checkpoint fase B, paso 1.500 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo base es un transformer de vídeo de 22B, por lo que se requiere hardware de datacenter.
- GPU recomendadas: A100 (medición reportada de ~0,4 fps end-to-end); presumiblemente H100 para mayor throughput, aunque no se documenta.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras GPU consumer; el tamaño del modelo base lo hace improbable sin cuantización agresiva no publicada.
- Opciones de despliegue: el pipeline del repositorio (`video_generator/ltx_run_chain.py` con `ltx_chain.py`) sobre el entrenador/formato LTX-2; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ~0,4 fotogramas por segundo end-to-end en una A100 según la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Enfoque de tracking | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Generator as the tracker (este) | LoRA sobre LTX-2.3 22B | 22B (base) | no disponible | Generación vídeo-a-vídeo con colores persistentes | LTX-2 Community License; uso no comercial por los datos | Hugging Face |
| Trackers clásicos (p. ej. ByteTrack, OC-SORT) | Pipeline detector + asociación | no aplica | no aplica | Detección y asociación explícitas | varía (MIT, Apache, etc.) | Repositorios públicos |
| Trackers basados en transformers (p. ej. MOTR, TrackFormer) | Transformer end-to-end | no disponible | no disponible | Query-based tracking | varía | Repositorios públicos |

No se dispone de datos de benchmarks comparativos con estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La detección es el lado débil del sistema (DetA 37,6 en DanceTrack), con peor comportamiento en aglomeraciones.
- Rendimiento bajo: aproximadamente 0,4 fotogramas por segundo end-to-end en una A100, lo que limita su uso en tiempo real.
- Entrenado exclusivamente con DanceTrack y SportsMOT, ambos con licencia de investigación no comercial; los checkpoints solo pueden usarse para investigación no comercial.
- Los adaptadores son derivados de LTX-2.3 y están sujetos a la LTX-2 Community License Agreement, con posibles restricciones adicionales de uso comercial.
- No se documentan idiomas soportados ni sesgos conocidos; al ser un modelo de visión, los sesgos dependerán de los datasets de entrenamiento (personas en escenarios de danza y deporte).
- Riesgo de alucinación visual: al ser un modelo generativo, puede producir colores o siluetas inconsistentes en oclusiones prolongadas o escenas fuera de distribución.
- El procedimiento completo requiere el códec del repositorio (`core/gentrack`) y la configuración exacta de prompt, decodificación y encadenamiento del apéndice A del paper; no es un pipeline plug-and-play.
- No hay datos publicados sobre cuantización, por lo que el despliegue en hardware limitado no está documentado.

## Enlaces

- Hugging Face: https://huggingface.co/Sonam5/Generator-as-the-tracker
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- Paper: https://arxiv.org/abs/2607.17120
- DOI: https://doi.org/10.48550/arXiv.2607.17120
- Código: https://github.com/Sonam525/Generator-as-the-tracker
- Página del proyecto: https://sonam525.github.io/Generator-as-the-tracker/
- Entrenador LTX-2: https://github.com/Lightricks/LTX-2
- Licencia LTX-2: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2
