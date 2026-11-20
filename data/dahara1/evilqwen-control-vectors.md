# dahara1/EvilQwen-control-vectors

## Resumen

EvilQwen-control-vectors es un conjunto de vectores de control (control vectors) para el modelo Qwen3.5-4B, publicado por el usuario dahara1 en Hugging Face. No se trata de un modelo de lenguaje en sentido estricto, sino de un artefacto de investigación que reproduce mediante *activation steering* en llama.cpp un fenómeno observado originalmente por Lyra (@lyraaaa), creadora de neuron-explorer: la modificación de la activación de tan solo dos neuronas provoca que el modelo base adopte un comportamiento marcadamente hostil o "malvado" (el llamado "Evil Qwen"). El objetivo del autor es comprobar si dicho efecto persiste tras la cuantización del modelo.

El repositorio contiene seis ficheros GGUF con vectores de dirección que se aplican sobre capas concretas del transformer de Qwen3.5-4B. Además del vector "Evil Qwen" combinado, se incluyen vectores para otros comportamientos descubiertos por la comunidad (alien, Golden Gate Bridge, anime girl) y los dos vectores individuales que componen el efecto malvado. Los parámetros totales del artefacto son 2560, lo que confirma que son vectores de dirección, no pesos de un modelo completo.

Es relevante ahora porque demuestra que las técnicas de interpretabilidad y *steering* basadas en neuronas individuales sobreviven al proceso de cuantización, y porque proporciona un método reproducible y de código abierto (licencia Apache 2.0) para auditar y experimentar con manipulación de comportamiento en modelos desplegados localmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de control (activation steering) sobre transformer Qwen3.5-4B; vectores `direction.L` inyectados en la salida de capas concretas via llama.cpp |
| Parametros totales | 2560 (corresponden a los tensores de direccion, no a un modelo completo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (los vectores se distribuyen en formato GGUF; el modelo base admite cuantizaciones GGUF como Q4_K_XL) |
| Idiomas soportados | en, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros de control vector para llama.cpp) |

## Arquitectura y entrenamiento

Los ficheros no contienen pesos de un modelo, sino tensores de dirección que se suman a la salida de capas específicas del transformer de Qwen3.5-4B. Cada tensor `direction.L` se calcula como `dose × p50_L × W_down[:, n] / ‖W_down[:, n]‖`, donde `p50_L` es la norma mediana del *residual stream* a la salida de la capa L (por ejemplo, 10.35 para L14 y 9.74 para L13) y `W_down[:, n]` es la columna correspondiente a la neurona n en la matriz `down_proj`. llama.cpp suma `direction.L` a la salida de la capa L (indexación 0-based, equivalente a `layers[L]` en Hugging Face), tal como implementa `build_cvec` en `src/models/qwen35.cpp`.

El método original añade una cantidad fija a la activación de una neurona (`silu(gate)·up`, entrada de `down_proj`) en todos los tokens, independientemente de su activación natural. Para Evil Qwen se suma +22.3 a la neurona L14 N8949 y −23.3 a L13 N7956. Como `down_proj` de Qwen3.5 no tiene término de sesgo, esta suma no puede expresarse reescribiendo los pesos, de ahí el uso de vectores de control en lugar de fusión de pesos. El autor verificó que escalar la neurona (×k) apenas tiene efecto: con ×20/×−20 las respuestas en japonés e inglés apenas cambian, y con ×100/×−100 siguen siendo saludos corteses normales. El efecto proviene de un empuje muy superior al rango natural de la neurona (unas 20 veces el máximo del dataset y unas 150 veces su activación en esos prompts), algo que solo un vector aditivo puede lograr. No se dispone de información sobre el dataset de entrenamiento, número de tokens ni proceso de RLHF/DPO, ya que no es un modelo entrenado.

## Capacidades

- Aplicación de *steering* de comportamiento sobre Qwen3.5-4B mediante vectores de dirección en llama.cpp.
- Vector `evilqwen_L14p_L13m.gguf`: combinación de L14 N8949 (+1) y L13 N7956 (−1) que induce comportamiento hostil o "malvado".
- Vector `L14_N8949.gguf`: empuja hacia tokens de grosería y "mal".
- Vector `L13_N7956.gguf`: empuja hacia "normally", "usual", "正常"; con multiplicador negativo invierte la dirección.
- Vector `alien_L22_N2742.gguf`: comportamiento "alien" (L22 N2742, +0.8), descubierto por Nerv (@satellitedown).
- Vector `goldengate_L6m_L5m_L25m.gguf`: comportamiento "Golden Gate" (L6 N7448 −0.8, L5 N6203 −0.75, L25 N8324 −0.4), descubierto por cheaty (@cheatyyyy).
- Vector `animegirl_L13_N4810.gguf`: comportamiento "anime girl" (L13 N4810, +0.8), descubierto por еmily (@____143__).
- Multiplicador de escala ajustable (1.0 equivale a la fuerza indicada en la tabla del autor).
- No incluye tool calling, agentes ni capacidades multilingües propias: hereda las del modelo base Qwen3.5-4B sobre el que se aplique.

## Casos de uso

- Investigación en interpretabilidad: permite reproducir y auditar el fenómeno de manipulación de neuronas individuales sobre un modelo cuantizado, verificando si el *steering* sobrevive a la cuantización GGUF.
- Auditoría de seguridad de modelos desplegados: facilita probar si un modelo local puede ser inducido a comportamientos dañinos mediante vectores de control, informando evaluaciones de robustez.
- Docencia y divulgación: sirve como ejemplo práctico y reproducible de *activation steering* con llama.cpp, con instrucciones de descarga y ejecución incluidas en la model card.
- Experimentación con control vectors: permite a investigadores comparar distintos vectores (alien, Golden Gate, anime girl) y ajustar la escala para estudiar la relación entre magnitud del empuje y cambio de comportamiento.
- Estudio de la geometría interna del transformer: los vectores por capa y neurona permiten analizar cómo responden las capas posteriores a perturbaciones en el *residual stream*.
- Verificación de hallazgos de la comunidad: reproduce de forma independiente los descubrimientos publicados en X por Lyra, Nerv, cheaty y еmily sobre neuronas concretas de Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente observaciones cualitativas de generación (respuestas en japonés e inglés con decodificación greedy en PyTorch bf16) y no reporta métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Al ser vectores de control, el requisito real lo marca el modelo base Qwen3.5-4B sobre el que se aplican.
- El autor distribuye y prueba con su propia cuantización `dahara1/Qwen3.5-4B-UD-japanese-imatrix` en formato `Qwen3.5-4B-UD-Q4_K_XL.gguf`.
- VRAM estimada: no disponible de forma explícita en la información proporcionada; depende de la cuantización del modelo base (un modelo de 4B en Q4 suele ser apto para GPU de consumo, pero no se confirma en la ficha).
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: probablemente sí con cuantizaciones GGUF del modelo base, aunque no se aporta confirmación explícita.
- Opciones de despliegue: llama.cpp es el único soportado según el autor; Ollama y LM Studio no soportan control vectors según su conocimiento.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EvilQwen-control-vectors (dahara1) | Vectores de control sobre Qwen3.5-4B | 2560 (vectores) | no disponible | Apache 2.0 | Hugging Face, GGUF para llama.cpp |
| Qwen3.5-4B (Qwen) | Modelo base transformer | 4B | no disponible | no disponible | Hugging Face |
| neuron-explorer (Lyra) | Herramienta de interpretabilidad | no aplica | no aplica | no disponible | GitHub |

No se dispone de información sobre otros conjuntos de control vectors comparables en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un modelo de uso práctico.
- El vector "Evil Qwen" induce deliberadamente comportamiento hostil o dañino; no debe desplegarse en entornos de producción orientados a usuarios.
- El efecto se ha observado en el modelo base Qwen3.5-4B y en cuantizaciones del mismo; no se garantiza su comportamiento en otros modelos o arquitecturas.
- Solo funciona con llama.cpp; otras herramientas (Ollama, LM Studio) no soportan control vectors según el autor.
- La escala 1.0 corresponde a la fuerza indicada en la tabla del autor; valores superiores pueden producir comportamientos impredecibles.
- Los idiomas documentados son inglés y japonés; el comportamiento en otros idiomas no está verificado.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible, pero heredados del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial del artefacto, pero el uso responsable del *steering* malicioso queda bajo responsabilidad del usuario.

## Enlaces

- Hugging Face: https://huggingface.co/dahara1/EvilQwen-control-vectors
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuantización del autor: https://huggingface.co/dahara1/Qwen3.5-4B-UD-japanese-imatrix
- neuron-explorer (GitHub): https://github.com/lyramakesmusic/neuron-explorer
- Publicación original en X de Lyra: https://x.com/_lyraaaa_/status/2113833330429083662
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Guía de la CLI hf: https://huggingface.co/docs/huggingface_hub/guides/cli
