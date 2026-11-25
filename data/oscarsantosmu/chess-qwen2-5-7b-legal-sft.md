# OscarSantosMu/chess-qwen2.5-7b-legal-sft

## Resumen

chess-qwen2.5-7b-legal-sft es un adaptador LoRA (PEFT) entrenado mediante supervisión fina (SFT) sobre el modelo base Qwen/Qwen2.5-7B-Instruct, orientado a la selección de jugadas de ajedrez. Lo desarrolla OscarSantosMu como parte de un experimento de investigación identificado como `e004_q25_7b_legal_20k_sft_s42`. No se trata de un modelo completo, sino de un adaptador que debe cargarse sobre el modelo base de Qwen para funcionar.

El adaptador recibe una posición de ajedrez en formato FEN junto con una lista ordenada lexicográficamente de jugadas legales en notación UCI, y devuelve exactamente una jugada legal en UCI (por ejemplo, `e2e4` o `a7a8q`). El entrenamiento emplea la plantilla de chat estándar de Qwen con una instrucción de sistema específica que restringe la salida a una única jugada sin explicaciones ni texto adicional.

Su relevancia es acotada y de carácter experimental: el propio autor advierte de que no garantiza jugadas legales ni óptimas y de que la fuerza de juego no se ha establecido mediante evaluaciones estandarizadas de motores de ajedrez. El repositorio es muy reciente, con cero descargas y cero likes en el momento de la consulta, y el tamaño del adaptador es de aproximadamente 0,1 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base tiene 7B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-7B-Instruct, no confirmada en la información) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT; requiere el modelo base) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only, mediante la técnica LoRA de ajuste fino eficiente en parámetros. El entrenamiento es de tipo SFT (supervised fine-tuning) y el experimento se denomina `e004_q25_7b_legal_20k_sft_s42`, lo que sugiere un conjunto de aproximadamente 20 000 ejemplos y una semilla 42, aunque el autor no detalla la composición del dataset ni el número exacto de tokens en la model card.

La representación de entrada es la variante `legal`: el prompt de usuario incluye la posición FEN y una lista ordenada lexicográficamente de las jugadas legales en notación UCI. La salida es una única jugada en UCI. El autor indica que los scripts de entrenamiento, los manifiestos de experimentos y los resultados de evaluación se mantienen en el repositorio de GitHub del proyecto, y que los hiperparámetros detallados y las métricas de evaluación se añadirán a medida que se consoliden los experimentos. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Selección de jugadas de ajedrez: dada una posición FEN y la lista de jugadas legales, devuelve una jugada en notación UCI.
- Salida restringida: responde con exactamente una jugada, sin explicaciones ni puntuación, según la instrucción de sistema de entrenamiento.
- Formato conversacional: utiliza la plantilla de chat estándar de Qwen2.5-Instruct.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking específicas del adaptador.
- Capacidades multilingües: no disponibles para el adaptador.
- Capacidad de generación de texto general: heredada del modelo base, pero no evaluada ni garantizada tras el ajuste.

## Casos de uso

- Investigación en ajedrez con LLM: el adaptador sirve como banco de pruebas para estudiar si un modelo de lenguaje puede aprender a seleccionar jugadas legales a partir de una lista de candidatas, comparando distintas representaciones de entrada.
- Generación de jugadas en pipelines experimentales: integrado con `python-chess` para validar posiciones y jugadas, permite automatizar partidas de prueba o generar datasets de jugadas candidatas para análisis posterior.
- Evaluación de representaciones de tablero: al fijar la variante `legal`, facilita experimentos controlados sobre cómo afecta el orden lexicográfico y la lista de jugadas legales al comportamiento del modelo.
- Reproducción de experimentos académicos: dado que el autor publica manifiestos y scripts en GitHub, el adaptador permite reproducir el experimento `e004_q25_7b_legal_20k_sft_s42` en entornos de investigación.
- Análisis de sesgos y errores en LLM aplicados a dominios reglados: útil para estudiar la tasa de jugadas ilegales o subóptimas que produce un modelo de lenguaje cuando se le restringe la salida a un conjunto finito de opciones.
- Prototipado educativo: para demostrar el flujo completo de carga de un modelo base más un adaptador PEFT con `transformers` y `peft`, y la construcción de prompts específicos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que las métricas de evaluación y los hiperparámetros detallados se añadirán a medida que se consoliden los experimentos, y que la fuerza de juego no se ha establecido mediante evaluaciones estandarizadas de motores de ajedrez ni competiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; al requerir el modelo base Qwen2.5-7B-Instruct, la VRAM dependerá de la cuantización elegida para dicho modelo base, no documentada en esta ficha.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende de la cuantización aplicada al modelo base, que no se especifica.
- Opciones de despliegue: la model card documenta carga mediante `transformers` y `peft` con `PeftModel.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chess-qwen2.5-7b-legal-sft | Adaptador LoRA para ajedrez | Qwen2.5-7B-Instruct | no disponible | no disponible | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (adaptadores o modelos especializados en selección de jugadas de ajedrez) en la información proporcionada.

## Limitaciones y advertencias

- El modelo no garantiza jugadas legales ni óptimas, según advierte el propio autor.
- La fuerza de juego no se ha establecido mediante evaluaciones estandarizadas de motores de ajedrez ni competiciones.
- Es imprescindible reproducir la representación `legal` en inferencia (instrucción de sistema, orden lexicográfico de jugadas legales y serialización de chat) para obtener resultados coherentes con el entrenamiento.
- El repositorio contiene únicamente el adaptador LoRA, no el modelo base; es necesario descargar Qwen/Qwen2.5-7B-Instruct por separado.
- Los datos de entrenamiento no están incluidos en el repositorio del modelo.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni restricciones de licencia para uso comercial, ya que la licencia figura como no disponible.
- El modelo está orientado a investigación experimental; no se recomienda su uso en producción sin una evaluación previa.

## Enlaces

- Hugging Face: https://huggingface.co/OscarSantosMu/chess-qwen2.5-7b-legal-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio GitHub del proyecto: no disponible (mencionado en la model card pero sin URL)
- Paper: no disponible
- Blog o demo: no disponible
