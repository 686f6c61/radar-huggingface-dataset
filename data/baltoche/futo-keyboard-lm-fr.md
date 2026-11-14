# baltoche/futo-keyboard-lm-fr

## Resumen

`baltoche/futo-keyboard-lm-fr` es un modelo de lenguaje transformer de tipo causal, con arquitectura LlamaForCausalLM y 36,3 millones de parámetros, diseñado específicamente para predicción de siguiente palabra y autocorrección en teclados Android. Lo desarrolla el usuario baltoche de forma independiente, adaptando al francés el pipeline comunitario alemán `jblechert/keyboard-lm-de`, y replicando exactamente la arquitectura, tokenizador y metadatos GGUF del modelo oficial inglés de FUTO Keyboard (`ml4`). Su relevancia radica en que cubre un hueco práctico: el teclado FUTO dispone de modelo inglés oficial, pero no de un equivalente francés verificado contra el cargador nativo de la aplicación.

El modelo se distribuye únicamente en formato GGUF cuantizado (Q8_0, Q6_K, Q4_K_M y F16), con pesos de entre 24 y 74 MB, pensados para ejecutarse en el propio dispositivo Android sin conexión. El entrenamiento se realizó íntegramente en una GPU de consumo (NVIDIA RTX 2080 de 8 GB) en aproximadamente 4 horas y 40 minutos, lo que demuestra la viabilidad de reproducir el pipeline completo con hardware asequible.

La propuesta técnica combina un preentrenamiento sobre texto plano (655 millones de tokens, 80.000 pasos) con un ajuste fino posterior mediante LoRA sobre datos sintéticos de errores tipográficos (formato XBU), una estrategia que preserva la calidad del modelo de lenguaje base mientras añade capacidad de autocorrección. El contexto de entrenamiento es de 256 tokens, aunque el modelo declara una ventana de 2048.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only), 8 capas, hidden 512, 8 cabezas (head_dim 64), FFN 1024 SwiGLU, RoPE base 10000, RMSNorm eps 1e-6 |
| Parametros totales | 36.348.416 (36,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 declarada; entrenado a 256 |
| Tipos de cuantizacion | Q8_0 (39 MB), Q6_K (31 MB), Q4_K_M (24 MB), F16 (74 MB) |
| Idiomas soportados | francés (`fr`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (F16 y cuantizaciones derivadas) |
| Tokenizador | SentencePiece unigram, vocab 15008, byte_fallback, `treat_whitespace_as_suffix=true`, `add_dummy_prefix=false` |
| Tokens de control | `<FUTO0..23>`, `<XBU>`, `<XBC>`, `<XEC>`, `<XC0..4>`, `<CHAR_A..Z>` |
| Metadatos GGUF | `base_v1 inverted_space xbu_char_autocorrect_v1 xc0_swipe_typing_v1 char_embed_mixing_v1 lora_finetunable_v1` |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo Llama, deliberadamente compacto: 8 capas, dimensión oculta de 512, 8 cabezas de atención con dimensión 64 y FFN SwiGLU de 1024. Usa RoPE con base 10000 y RMSNorm con epsilon 1e-6. La arquitectura replica exactamente la del modelo oficial inglés de FUTO (`ml4`), verificado contra el código del cargador nativo de `futo-org/android-keyboard` y contra el fichero `ml4_1_f16_meta_fixed.gguf`. El tokenizador SentencePiece unigram de vocabulario 15008 emplea `byte_fallback` y el formato de espacio invertido (`treat_whitespace_as_suffix=true`), requisito del runtime de FUTO.

El entrenamiento se dividió en dos fases. Primero, un preentrenamiento sobre texto plano con 80.000 pasos, batch 32, learning rate 6e-4 y warmup de 2.000 pasos, alcanzando 655 millones de tokens a unos 66.000 tokens por segundo en la RTX 2080. Los datos provienen de Tatoeba FR, OpenSubtitles v2018 FR, FineWeb2 `fra_Latn` (unos 8 GB) y Wikipedia francesa, con limpieza y deduplicación que redujo 193 millones de líneas brutas a 45 millones de líneas de entrenamiento. Después, un ajuste fino LoRA en dos rondas (15.000 pasos y 20.000 pasos adicionales con `xbu-weight` 0.75) sobre 19,9 millones de líneas de datos sintéticos de autocorrección, generados a partir de 5 millones de frases con errores tipográficos conscientes del teclado AZERTY, incluyendo restauración de acentos ("cafe" → "café"). El autor documenta que mezclar datos XBU directamente en el preentrenamiento degrada gravemente el modelo de lenguaje (PPL ~319), de ahí la estrategia de preentrenar y luego aplicar LoRA.

## Capacidades

- Predicción de siguiente palabra en francés, con evaluación medida de top-1 (40,2%) y top-5 (61,7%) sobre el conjunto conversacional.
- Autocorrección de errores tipográficos en formato XBU, con una tasa de acierto exacto en modo greedy del 29,3% sobre el checkpoint final.
- Restauración de acentos franceses a partir de texto sin diacríticos.
- Soporte de tokens de control específicos del teclado FUTO: `<XBU>`, `<XBC>`, `<XEC>`, `<XC0..4>` y `<CHAR_A..Z>`, que habilitan la corrección a nivel de carácter.
- Compatibilidad con el pipeline de "swipe typing" declarada en los metadatos GGUF (`xc0_swipe_typing_v1`).
- Capacidad de ajuste fino adicional vía LoRA (`lora_finetunable_v1`).
- Modelo de lenguaje causal general sobre texto francés, aunque su escala (36 M) limita la generación libre a completaciones cortas.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- **Teclado predictivo en Android sin conexión**: el modelo se importa directamente en FUTO Keyboard mediante "Import from file" y se asigna al idioma francés; los ficheros Q6_K (31 MB) y Q4_K_M (24 MB) están dimensionados para ejecutarse en el propio teléfono con latencia baja y sin red.
- **Autocorrección en tiempo real durante la escritura**: los tokens `<XBU>`/`<XBC>`/`<XEC>` permiten al runtime solicitar correcciones a nivel de carácter; útil para usuarios que escriben rápido en AZERTY y cometen transposiciones o errores de acento.
- **Restauración de acentos en texto francés**: dado que el pipeline XBU incluye la transformación "cafe" → "café", el modelo puede integrarse en flujos de normalización de texto introducido sin diacríticos, por ejemplo en formularios o entradas de teclados físicos sin acentos.
- **Prototipado de teclados para lenguas minorizadas**: el pipeline completo (scripts 01 a 09) es reutilizable; un equipo que quiera un modelo para otra lengua romance puede partir de este repositorio como plantilla verificada contra el cargador nativo de FUTO.
- **Investigación sobre modelos de lenguaje ultracompactos**: con 36 M de parámetros y un entrenamiento reproducible en una RTX 2080 en menos de 5 horas, sirve como banco de pruebas para estudiar estrategias de preentrenamiento más LoRA frente a mezcla directa de datos auxiliares.
- **Evaluación de cuantizaciones en dispositivos móviles**: los cuatro ficheros GGUF (F16, Q8_0, Q6_K, Q4_K_M) permiten medir el compromiso entre tamaño, latencia y calidad en hardware Android real, con la referencia F16 como línea base.
- **Generación de sugerencias de siguiente palabra en aplicaciones de mensajería**: la ventana de 2048 tokens (aunque entrenada a 256) permite condicionar la predicción sobre el contexto reciente de la conversación, adecuado para sugerencias de una o dos palabras.

## Benchmarks y rendimiento

| Modelo | PPL conversacional | Top-1 / Top-5 siguiente palabra | XBU autocorrect exacto (greedy) |
|---|---|---|---|
| Final (`fr_keyboard_merged2` → `output/`) | 27,4 | 40,2% / 61,7% | 29,3% |
| LM plano antes de LoRA (`fr_keyboard_v1_final_backup`) | 22,1 | 40,9% / 63,0% | 0% |
| Mezcla ingenua de XBU en preentrenamiento (~5% de tokens) | ~319 | no disponible | 42% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no está orientado a esas tareas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB en todas las cuantizaciones; el fichero F16 ocupa 74 MB y el Q4_K_M 24 MB, por lo que la carga en memoria es trivial.
- **GPU recomendadas**: cualquier GPU con más de 1 GB de VRAM; el entrenamiento se realizó en una NVIDIA RTX 2080 de 8 GB. Para inferencia en servidor, una T4 o superior es más que suficiente.
- **Consumer GPU**: cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050 o integradas con suficiente memoria compartida.
- **Dispositivos móviles**: es el destino principal; los ficheros Q6_K (31 MB) y Q4_K_M (24 MB) están pensados para ejecutarse en Android a través del runtime nativo de FUTO Keyboard.
- **Opciones de despliegue**: el runtime nativo de FUTO Keyboard (carga GGUF con los metadatos `keyboardlm.*`); llama.cpp y derivados (Ollama, llama-cpp-python) pueden cargar el GGUF, aunque las capacidades XBU dependen del runtime de FUTO. vLLM y TGI no están indicados para este formato y escala.
- **Latencia y throughput**: no se han publicado mediciones de latencia en dispositivo. En entrenamiento se alcanzaron ~66.000 tokens/s en una RTX 2080; en inferencia móvil se espera latencia de milisegundos por token dada la escala, aunque no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `baltoche/futo-keyboard-lm-fr` | 36,3 M | 2048 (entrenado a 256) | fr | CC BY-SA 4.0 | GGUF | Réplica del `ml4` oficial adaptada al francés |
| `ml4` (FUTO oficial, inglés) | ~36 M (misma arquitectura) | 2048 | en | no disponible en la información | GGUF | Referencia arquitectónica; el autor verifica compatibilidad exacta |
| `jblechert/keyboard-lm-de` | ~36 M (misma arquitectura) | 2048 | de | no disponible en la información | GGUF | Pipeline original alemán del que deriva este trabajo |
| `fr_keyboard_v1_final_backup` (checkpoint intermedio) | 36,3 M | 2048 | fr | CC BY-SA 4.0 | safetensors/GGUF | LM plano sin LoRA; mejor PPL (22,1) pero 0% en XBU |

No se dispone de datos de benchmarks comparativos con modelos de propósito general de tamaño similar (por ejemplo, modelos de 30-50 M en francés) en la información proporcionada.

## Limitaciones y advertencias

- **Escala muy reducida**: con 36 M de parámetros, la generación libre de texto es muy limitada; el modelo está diseñado para predicción y corrección, no para respuestas conversacionales.
- **Contexto efectivo corto**: aunque declara 2048 tokens, se entrenó a 256; el rendimiento más allá de esa longitud no está validado.
- **Sesgos de los datos**: entrenado sobre Tatoeba, OpenSubtitles, FineWeb2 y Wikipedia; puede reflejar sesgos de registro coloquial de subtítulos y de cobertura desigual de la Wikipedia francesa.
- **Riesgo de alucinación**: bajo en su tarea objetivo (predicción de palabra), pero presente si se usa para generación libre; no debe emplearse como fuente de hechos.
- **Licencia CC BY-SA 4.0**: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia; conviene revisar la compatibilidad si se integra en productos propietarios.
- **Dependencia del runtime de FUTO**: las capacidades XBU y de swipe typing solo se activan en el cargador nativo de FUTO Keyboard; en llama.cpp genérico el modelo funciona como LM causal pero sin esas funciones.
- **Cobertura limitada a francés**: no soporta otros idiomas; los tokens `<CHAR_A..Z>` están orientados al alfabeto latino.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.
- **Datos de entrenamiento con licencias heterogéneas**: Tatoeba (CC BY 2.0), OpenSubtitles (CC BY) y FineWeb2 (ODC-By); la model card no detalla la licencia de todos los componentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baltoche/futo-keyboard-lm-fr
- FUTO Keyboard: https://keyboard.futo.org
- Pipeline alemán de referencia: https://github.com/jblechert/keyboard-lm-de
- Repositorio del teclado FUTO (cargador nativo): https://github.com/futo-org/android-keyboard
- No se han encontrado en la información disponible papers, blogs ni demos adicionales.
