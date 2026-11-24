# hugonis/chatux-onejev-4b-lora

## Resumen

ChatUX OneJev 4B LoRA es un adaptador PEFT de tipo LoRA entrenado sobre el modelo multimodal OmniJev/OneJev1.6-4B (familia Qwen3.5, aproximadamente 4.000 millones de parametros). Lo desarrolla el usuario hugonis y su proposito es muy concreto: puntuar capturas de pantalla de interfaces de chat con IA en una sola pasada forward, sin generacion autorregresiva de tokens. El adaptador responde a preguntas de decision tipadas (comprobaciones binarias `noul`, clasificacion `choice` y puntuaciones ordinales `score`) devolviendo probabilidades calibradas.

La relevancia del modelo reside en su enfoque: en lugar de generar texto libre, reutiliza la cabeza de lectura (readout) del modelo base OneJev con una perdida que combina entropia cruzada y Brier loss, lo que produce salidas probabilisticas calibradas y medibles con metricas como Brier score, NLL o ECE. Sobre 12 pantallas de produccion no vistas durante el entrenamiento, el adaptador reduce el error Brier casi a la mitad y eleva la precision global del 72,62 % al 84,52 % en 84 filas de decision.

El adaptador ocupa apenas 0,1 GB en el repositorio y anade 64,9 millones de parametros entrenables en `bfloat16` sobre el modelo base congelado. Esta pensado para auditorias automatizadas de calidad visual y UX en pipelines de desarrollo de interfaces de chat, no como modelo conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5 (OneJev1.6-4B) con torre de vision y `lm_head` congelados |
| Parametros totales | 64,9 millones de parametros entrenables en el adaptador (modelo base de aproximadamente 4.000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en `bfloat16`; el modelo base admite las cuantizaciones que soporte la libreria de despliegue) |
| Idiomas soportados | no disponible (entrenado sobre interfaces de chat en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); fusionable con el modelo base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre OmniJev/OneJev1.6-4B, un modelo multimodal de la familia Qwen3.5 con torre de vision. Durante el entrenamiento se congelan tanto la torre de vision como el `lm_head`, y solo se adaptan las proyecciones del lenguaje mediante LoRA con `r=32`, `alpha=64` y `dropout=0.05`, aplicado sobre 248 proyecciones del modelo. El resultado son 64,9 millones de parametros entrenables exportados en `bfloat16`.

La innovacion principal es el objetivo de entrenamiento: se utiliza la perdida de lectura oficial de OneJev, que combina entropia cruzada con Brier loss (peso 1.0), calculada en el token final sobre los slots de `qev-labels-v2`. Esto convierte al modelo en un clasificador probabilistico calibrado en una sola pasada, en lugar de un generador de texto. Los datos de entrenamiento constan de 854 filas de decision construidas a partir de 122 capturas en vivo de 19 aplicaciones publicas de chat con IA, emparejando pantallas limpias con defectos CSS introducidos en el DOM en vivo. Se aplica aumentacion mediante permutacion aleatoria del orden de opciones por fila y epoca, junto con formatos JSON compactos e indentados, para eliminar sesgos de posicion. El checkpoint final corresponde a la epoca 2 de 4, seleccionada por el menor Brier score en validacion, con `lr=8e-5`, decaimiento coseno y tamano de lote 16.

## Capacidades

- Evaluacion binaria (`noul`) de comprobaciones de calidad: `ship_ready`, `legible_contrast`, `clean_layout`, `touch_ergonomics`, `readable_typography`.
- Clasificacion multiclase (`choice`) de defectos visuales: `none`, `low_contrast`, `overlap_overflow`, `tiny_targets`, `crushed_typography`.
- Puntuacion ordinal (`score`) de calidad de diseno en escala 0-4.
- Salidas probabilisticas calibradas (probabilidades por clase y por umbral) en una sola pasada forward, sin generacion de tokens.
- Procesamiento de imagen y texto conjuntamente (pipeline `image-text-to-text`).
- Soporte de consultas agrupadas con prefijo compartido mediante el endpoint `/v1/systemone` de Flide, evaluando multiples preguntas sobre la misma captura.
- Capacidad de fusionar el adaptador en el modelo base para despliegue sin sobrecarga de VRAM del adaptador.
- No dispone de tool calling, razonamiento multi-paso ni modo thinking: su funcion es la clasificacion visual de UI.

## Casos de uso

- Auditoria automatizada de calidad visual en CI/CD: integrar el adaptador en un pipeline que capture la interfaz de chat tras cada despliegue y evalue `ship_ready` y `primary_defect`, bloqueando merges cuando la probabilidad de envio caiga por debajo del umbral recomendado (0,25).
- Control de regresiones de diseno: comparar capturas de la rama principal con las de la rama de desarrollo y detectar caidas en `clean_layout` o `legible_contrast` gracias a las probabilidades calibradas y al bajo Brier score.
- Revision de accesibilidad de contraste: usar `legible_contrast` (100 % de precision y Brier de 0,0005 en la evaluacion) para marcar automaticamente pantallas con texto o botones lavados.
- Priorizacion de deuda de UX: clasificar el defecto principal con `primary_defect` (83,3 % de precision) para enrutar incidencias al equipo correspondiente (tipografia, ergonomia tactil, desbordamiento).
- Puntuacion de calidad de diseno en paneles internos: emplear `design_quality` (MAE de 0,68 frente a 1,40 en zero-shot) para generar una metrica numerica de calidad visual por version de producto.
- Evaluacion comparativa de replicas o prototipos: puntuar capturas de distintas implementaciones de una misma interfaz de chat (por ejemplo, replicas de asistentes) con una unica peticion agrupada y obtener probabilidades comparables.
- Filtrado previo en conjuntos de datos de UI: etiquetar grandes lotes de capturas de interfaces de chat con `noul` y `choice` antes de un etiquetado humano, reduciendo el coste de revision manual.

## Benchmarks y rendimiento

Resultados medidos en vivo con Flide sobre 12 capturas de produccion de T3 Chat y la replica de Claude de assistant-ui, completamente disjuntas del entrenamiento, sobre 84 filas de decision bloqueadas.

| Metrica | OneJev1.6-4B zero-shot | chatux-onejev-4b-lora | Delta |
|---|---:|---:|---:|
| Precision global | 72,62 % | 84,52 % | +11,90 pts |
| Brier score global | 0,3662 | 0,1854 | -49,4 % |
| NLL global | 0,8100 | 0,4449 | -45,1 % |
| ECE global | 0,1214 | 0,0754 | -37,9 % |
| `ship_ready` (`noul`) | 50,0 % acc / 0,6268 Brier | 66,7 % acc / 0,3341 Brier | +16,7 pts |
| Brecha `ship_ready` limpio frente a roto | +0,0925 | +0,2116 | 2,3x |
| `legible_contrast` (`noul`) | 100,0 % acc / 0,1552 Brier | 100,0 % acc / 0,0005 Brier | -99,7 % Brier |
| `clean_layout` (`noul`) | 83,3 % acc / 0,3186 Brier | 91,7 % acc / 0,1734 Brier | +8,3 pts |
| `touch_ergonomics` (`noul`) | 83,3 % acc / 0,3794 Brier | 83,3 % acc / 0,2635 Brier | -30,5 % Brier |
| `readable_typography` (`noul`) | 100,0 % acc / 0,1192 Brier | 100,0 % acc / 0,0208 Brier | -82,6 % Brier |
| `primary_defect` (`choice` de 5 clases) | 66,7 % acc / 0,5423 Brier | 83,3 % acc / 0,3409 Brier | +16,7 pts |
| `design_quality` (`score` 0-4) | 25,0 % acc / 1,40 MAE | 66,7 % acc / 0,68 MAE | -51,0 % MAE |

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB; el coste real de inferencia lo determina el modelo base OneJev1.6-4B en `bfloat16`, que ronda los 8 GB de pesos mas el coste de la torre de vision y las activaciones.
- En configuraciones ajustadas de 8 GB multi-GPU, la model card recomienda fusionar el LoRA en el modelo base para eliminar la sobrecarga de VRAM del adaptador y servir con `--tp 2`.
- GPU recomendadas: no disponibles de forma explicita en la informacion proporcionada; por tamano del modelo base, encajan GPU de 16-24 GB o superiores (por ejemplo, RTX 4090, A100, H100) y configuraciones multi-GPU de 8 GB.
- Cabe en GPU de consumo si se cuantiza el modelo base o se reparte entre varias GPU; no se especifican cuantizaciones concretas soportadas.
- Despliegue: Flide (`flide serve`, con deteccion automatica del formato `onejev` y endpoint `/v1/systemone`) o, fusionando previamente, `transformers` + `peft` con `Qwen3_5ForConditionalGeneration`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al requerir una sola pasada forward sin generacion autorregresiva, el coste por consulta es inferior al de un modelo generativo del mismo tamano, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. La unica comparacion publicada es contra el propio modelo base sin adaptador (OneJev1.6-4B zero-shot), cuyos resultados figuran en la tabla de benchmarks. No hay informacion sobre alternativas especializadas en evaluacion visual de interfaces de usuario.

## Limitaciones y advertencias

- Entrenado exclusivamente con interfaces de chat con IA en ingles, tanto de escritorio como moviles; paneles densos, otras familias de interfaz o escrituras no latinas pueden requerir datos adicionales de entrenamiento.
- La comprobacion `ship_ready` tiende a ser conservadora tras el ajuste: media de 0,36 en pantallas limpias y 0,15 en pantallas rotas. Se recomienda ajustar el umbral en torno a 0,25 o combinarla con `primary_defect` y `design_quality`.
- Riesgo de alucinacion no aplicable en el sentido generativo (no produce texto libre), pero las probabilidades pueden estar mal calibradas en dominios distintos al de entrenamiento.
- El conjunto de evaluacion es pequeno (12 capturas, 84 filas), por lo que las metricas tienen alta varianza; no se publican intervalos de confianza.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base OmniJev/OneJev1.6-4B debe verificarse por separado en cuanto a sus propios terminos.
- No soporta tool calling, agentes ni razonamiento multi-paso; usarlo fuera de la clasificacion visual de UI no es su proposito.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugonis/chatux-onejev-4b-lora
- Modelo base: https://huggingface.co/OmniJev/OneJev1.6-4B
- Libreria Flide en PyPI: https://pypi.org/project/flide/
