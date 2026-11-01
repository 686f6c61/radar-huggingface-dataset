# DabinJeong/LocoGen

## Resumen

LocoGen es un método de generación controlada de secuencias de ADN regulador (enhancers) desarrollado por Dabin Jeong, publicado bajo licencia MIT. No se trata de un modelo de lenguaje al uso, sino de un componente específico dentro de un pipeline de difusión discreta enmascarada (masked discrete diffusion) sobre secuencias de ADN. El repositorio de HuggingFace contiene únicamente el **separador enmascarado** (masked separator) entrenado en la etapa 1 del método, con un checkpoint por línea celular (HepG2, K562 y SK-N-SH).

El problema que resuelve es la generación de secuencias de ADN con actividad reguladora controlada sin necesidad de reentrenar el modelo base. LocoGen congela un backbone MDLM (DRAKES) y aplica una guía (guidance) cuyo gradiente se localiza en posiciones reguladoras invariantes mediante un separador entrenado con V-REx. Esto permite muestrear enhancers de 200 nucleótidos que satisfacen objetivos de actividad específicos de cada línea celular.

Es relevante para la comunidad de biología computacional y genómica sintética porque ofrece una vía de generación condicionada sobre modelos de difusión de ADN preentrenados, con un diseño explícito para evitar la fuga de información entre líneas celulares (invariante mediante V-REx). El repositorio es pequeño (0,1 GB) y contiene solo pesos del separador, no el backbone ni los oráculos de recompensa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Separador enmascarado (masked separator) sobre backbone MDLM de difusión discreta; arquitectura definida por config YAML, no por el checkpoint |
| Parametros totales | 11.135.495 por checkpoint (uno por línea celular) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Secuencias de 200 nucleótidos (longitud fija de generación) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de ADN, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch (`.ckpt`, payload `{"model": state_dict}`, 316 tensores, ~45 MB) |

## Arquitectura y entrenamiento

LocoGen se compone de dos etapas. En la etapa 1 se entrena un **separador enmascarado** que aprende a identificar posiciones reguladoras invariantes entre líneas celulares, usando un objetivo V-REx (Variance Risk Extrapolation) para forzar invarianza. En la etapa 2, ese separador se usa para localizar el gradiente de guía durante el muestreo con un backbone MDLM congelado (DRAKES), sin fine-tuning del backbone. La generación se realiza mediante difusión discreta enmascarada sobre secuencias de 200 nt representadas como one-hot suave de 4 canales (A, C, G, T).

El repositorio solo redistribuye el separador de la etapa 1. El backbone MDLM, los oráculos de recompensa (entrenamiento y evaluación) y el dataset Gosai deben obtenerse por separado desde el repositorio de código. El checkpoint no contiene metadatos de arquitectura: el loader construye el modelo a partir de un YAML (`configs/enhancer_gosai_masked_separator_*.yaml`) y carga los pesos encima. En inferencia solo se leen los campos de arquitectura y `target_idx` (0 para HepG2, 1 para K562, 2 para SK-N-SH); los pesos de pérdida del entrenamiento no afectan al muestreo. No se dispone de información sobre el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la referencia al dataset Gosai.

## Capacidades

- Generación de secuencias de ADN regulador (enhancers) de 200 nucleótidos condicionadas a una línea celular concreta (HepG2, K562, SK-N-SH).
- Guía localizada: el separador produce una máscara `M` de forma `(B, 200)` en `[0, 1]` que restringe el gradiente de guía a posiciones reguladoras invariantes.
- Muestreo con backbone congelado: no requiere fine-tuning del MDLM, solo el separador entrenado.
- Control de intensidad de guía mediante hiperparámetros (`--lam`, `--alpha_ratio`, `--alpha_cap`).
- Filtrado OOD y de silenciamiento localizado (`--ood_sil_localized`, `--ood_sil_threshold`, `--sil_t_threshold`).
- Generación por lotes con semilla reproducible (`--num_samples`, `--batch_size`, `--seed`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de biología computacional, no un LLM.

## Casos de uso

- **Diseño de enhancers específicos de línea celular**: dado un objetivo de actividad en HepG2, K562 o SK-N-SH, LocoGen muestrea secuencias de 200 nt guiadas por el oráculo correspondiente. Útil para cribados de elementos reguladores en genómica sintética.
- **Generación condicionada sin reentrenar el backbone**: equipos que ya disponen del MDLM DRAKES pueden añadir el separador y obtener guía localizada sin coste de fine-tuning, lo que reduce el cómputo frente a alternativas que requieren ajuste del modelo base.
- **Estudios de invarianza entre líneas celulares**: el separador entrenado con V-REx permite analizar qué posiciones reguladoras son invariantes entre tipos celulares, un caso de uso analítico además del generativo.
- **Aumento de datasets de enhancers**: generar lotes de 640 secuencias por ejecución (`--num_samples 640`) para ampliar conjuntos de entrenamiento o validación en modelos de predicción de actividad reguladora.
- **Validación de pipelines de difusión discreta**: el repositorio incluye los ajustes de referencia completos (`--lam 0.7`, `--alpha_ratio 3.0`, `--alpha_cap 20.0`, `--num_steps 128`), lo que lo hace útil como referencia reproducible para comparar métodos de guía en difusión discreta sobre ADN.
- **Investigación en seguridad biológica computacional**: la generación de secuencias reguladoras sintéticas permite estudiar riesgos y controles en diseño de ADN, siempre dentro de marcos regulatorios aplicables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los resultados reportados promedian sobre las semillas 0, 1 y 2, pero no incluye cifras concretas de métricas (actividad, fidelidad, diversidad) ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el separador es pequeño (~11,1 M parámetros, ~45 MB por checkpoint), pero el muestreo requiere además el backbone MDLM DRAKES y los oráculos de recompensa, cuyos requisitos no se detallan en la información disponible.
- GPU recomendadas: no disponible. Por el tamaño del separador cabría en cualquier GPU consumer, pero el coste real lo determina el backbone MDLM y los oráculos, no redistribuidos aquí.
- ¿Cabe en GPU consumer? El separador sí; el pipeline completo depende del backbone DRAKES, sin datos de VRAM publicados.
- Opciones de despliegue: ejecución vía el repositorio de código (`scripts.drakes_backbone.mood_guided_sample_mdlm`), con PyTorch y OmegaConf. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. Se documenta `--num_steps 128` por defecto y `--batch_size 64`, pero sin cifras de tiempo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de generación de ADN regulador con guía localizada, ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio contiene **solo el separador**; sin el backbone MDLM DRAKES, los oráculos de recompensa y el dataset Gosai no se puede muestrear nada. Es un componente, no un modelo autónomo.
- El checkpoint no incluye metadatos de arquitectura: hay que cargar el YAML correcto del repositorio de código o fallará la carga.
- Riesgo de emparejamiento incorrecto: el oráculo se selecciona por `--cell_type`; si se combina con un `--ms_config`/`--ms_ckpt` de otra línea celular, la puntuación se hace contra la línea equivocada de forma silenciosa.
- `--lam` y `--alpha_ratio` por sí solos no reproducen los resultados reportados; se requieren también `--alpha_cap`, `--ood_sil_localized`, `--ood_sil_threshold` y `--sil_t_threshold`.
- Sesgos conocidos: no documentados. Al ser un modelo de ADN, los sesgos relevantes serían de composición del dataset Gosai y de las líneas celulares cubiertas (solo tres), no sesgos sociales.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero las secuencias generadas pueden no tener actividad biológica real; la validación experimental es imprescindible.
- Limitaciones de idioma: no aplica (modelo de ADN).
- Licencia MIT: permite uso comercial, pero el backbone DRAKES, los oráculos y el dataset Gosai tienen sus propias condiciones, no cubiertas por esta licencia.
- Advertencia de bioseguridad: la generación de secuencias reguladoras sintéticas debe someterse a los controles regulatorios y de bioseguridad aplicables en cada jurisdicción.
- Estado de publicación: la model card remite al repositorio de código para el estado de publicación; no se confirma paper revisado por pares en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/DabinJeong/LocoGen
- Repositorio de código (referenciado en la model card): https://github.com/Lotfollahi-lab/LocoGen
- Repositorio alternativo citado en la sección de cita: https://github.com/DabinJeong/LocoGen
- Dependencias externas (backbone DRAKES, oráculos, dataset Gosai): descritas en el README del repositorio de código, sección "External dependencies (one-time)"
