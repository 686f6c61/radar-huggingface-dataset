# GRRNMAKE/SymbTokenizer

## Resumen

SymbTokenizer es el tokenizador rápido oficial del runtime SYNAXIM y de los formatos de contenedor binario nativos `.symb`, empleados por modelos de razonamiento agéntico como Chíìkè y Dúdú. Lo publica el usuario GRRNMAKE bajo la licencia COGNITUS PUBLIC SYMBOLIC LICENSE (CPSL) 1.0, con copyright atribuido a Cognitus Lab. No es un modelo de lenguaje: es un componente de tokenización (arquitectura BPE con backend rápido en Rust) que debe acompañar a los pesos de los modelos que lo utilizan, y que resulta relevante porque define el contrato de tokens (identificadores especiales, plantilla de chat y límites de contexto) que cualquier despliegue sobre SYNAXIM necesita replicar.

El repositorio tiene un tamaño de 0.0 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere una publicación muy reciente o de circulación restringida. La información pública se limita a la model card: no hay pesos, no hay resultados de evaluación y no hay documentación del corpus de entrenamiento del tokenizador.

La ficha, por tanto, describe con precisión lo que el autor declara (vocabulario de 128.256 entradas, contexto de hasta 131.072 tokens, conjunto de tokens especiales estilo Llama 3) y marca explícitamente como no disponible todo aquello que la información proporcionada no cubre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Byte-Pair Encoding (BPE) con backend rápido (fast tokenizer) |
| Parámetros totales | no disponible (no es un modelo de lenguaje; es un tokenizador) |
| Parámetros activos | no aplica |
| Longitud de contexto | hasta 131.072+ tokens (según declara el autor) |
| Tipos de cuantización | no aplica |
| Idiomas soportados | en, multilingual (declarado en las etiquetas) |
| Licencia | COGNITUS PUBLIC SYMBOLIC LICENSE (CPSL) 1.0, noviembre de 2026 (etiqueta `license: other`, `license_name: cpsl-1.0`) |
| Formato de pesos | `tokenizer.json` (formato Hugging Face `tokenizers`); compatible con `transformers` y con el runtime nativo SYNAXIM |

Datos adicionales declarados:

| Parámetro | Valor |
|---|---|
| Tamaño de vocabulario | 128.256 |
| Token BOS | `<|begin_of_text|>` (ID 128000) |
| Token PAD / fin de stream | `<|end_of_text|>` (ID 128001) |
| Inicio de cabecera de rol | `<|start_header_id|>` (ID 128006) |
| Fin de cabecera de rol | `<|end_header_id|>` (ID 128007) |
| Fin de mensaje | `<|eom_id|>` (ID 128008) |
| Fin de turno / EOS | `<|eot_id|>` (ID 128009) |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El componente es un tokenizador BPE de vocabulario 128.256, empaquetado como fast tokenizer (implementación en Rust expuesta a través de la librería `tokenizers`). La model card no documenta el corpus utilizado para aprender las fusiones BPE, ni el número de tokens de entrenamiento, ni la composición lingüística del vocabulario más allá de las etiquetas `en` y `multilingual`. Tampoco se indica si se aplican normalizaciones Unicode específicas, pretokenizadores por regex o estrategias de byte fallback.

La innovación relevante no está en el algoritmo —BPE es estándar— sino en la integración: el tokenizador está diseñado para el runtime SYNAXIM y para contenedores binarios `.symb`, e incluye una API nativa (`CozetTokenizer` del paquete `chike_symb_inference`) además de las rutas estándar de Hugging Face. El esquema de tokens especiales reproduce el de la familia Llama 3 (BOS 128000, EOS 128009, cabeceras de rol 128006/128007, fin de mensaje 128008), lo que facilita la portabilidad de plantillas de chat, pero no garantiza compatibilidad de pesos con modelos Llama 3: solo comparten convención de identificadores.

No se declara en la información disponible ningún proceso de entrenamiento con RLHF, DPO ni ajuste alguno, lo cual es coherente con la naturaleza del artefacto.

## Capacidades

- Tokenización BPE de texto con vocabulario de 128.256 entradas.
- Codificación y decodificación mediante `transformers.AutoTokenizer` y mediante `tokenizers.Tokenizer` con backend Rust.
- Plantilla de chat integrada (`apply_chat_template`) con roles system/user y prompt de generación.
- Soporte de tokens especiales para delimitación de turnos y mensajes: BOS, EOS, PAD, cabeceras de rol, fin de mensaje.
- Manejo declarado de contextos de hasta 131.072+ tokens (el límite efectivo depende del modelo que consuma el tokenizador).
- API nativa para el runtime SYNAXIM y los contenedores `.symb` (`CozetTokenizer`).
- Cobertura declarada multilingüe, con etiqueta explícita para inglés.

No se declara soporte de visión, audio, tool calling ni modos de razonamiento: esas capacidades, si existen, pertenecen a los modelos Chíìkè y Dúdú que consumen este tokenizador, no al tokenizador en sí.

## Casos de uso

- Despliegue de modelos SYNAXIM en producción: cargar `GRRNMAKE/SymbTokenizer` con `AutoTokenizer` para preprocesar entradas y garantizar que los identificadores especiales coinciden con los esperados por el runtime; imprescindible para evitar desalineaciones de BOS/EOS que degradan la generación.
- Integración en pipelines de inferencia nativa: usar `CozetTokenizer` de `chike_symb_inference` cuando se ejecutan modelos en formato `.symb` fuera del ecosistema Hugging Face, manteniendo la misma tokenización que en entrenamiento.
- Construcción de plantillas de chat reproducibles: `apply_chat_template` genera el formato exacto de cabeceras de rol y delimitadores de turno, lo que permite auditar y versionar prompts de sistema en aplicaciones multi-turno.
- Preprocesado de corpus largos: con un límite declarado de 131.072+ tokens, es adecuado para tokenizar documentos extensos (informes, expedientes, código de repositorio) antes de pasarlos a un modelo con ventana amplia.
- Evaluación comparativa de tokenizadores: al compartir esquema de tokens especiales con Llama 3, sirve para medir diferencias de fertilidad (tokens por palabra) y de coste por token frente a otros tokenizadores en corpus en inglés y multilingües.
- Servidores de tokenización dedicados: el backend Rust permite exponer un endpoint HTTP de encode/decode de baja latencia para arquitecturas donde el preprocesado se separa del servidor de inferencia (por ejemplo, vLLM o TGI con tokenizador externo).
- Verificación de compatibilidad en migraciones: antes de mover un modelo de un runtime a otro, comprobar con este tokenizador que los IDs especiales (128000-128009) se preservan y que la decodificación es idéntica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de fertilidad, cobertura de vocabulario, latencia de tokenización ni comparaciones con otros tokenizadores.

## Requisitos de hardware

- VRAM: no aplica; un tokenizador no requiere GPU. El artefacto ocupa 0.0 GB en el repositorio y se carga en memoria principal (del orden de decenas de MB con el vocabulario de 128.256 entradas, aunque el tamaño exacto del `tokenizer.json` no se declara).
- GPU recomendadas: ninguna específica; la tokenización se ejecuta en CPU mediante el backend Rust.
- GPU de consumo: irrelevante para este componente; la GPU solo importa para el modelo que consuma los tokens.
- Opciones de despliegue: `transformers` (`AutoTokenizer`), `tokenizers` (Rust), runtime nativo SYNAXIM vía `chike_symb_inference`, y servidores de inferencia que acepten un tokenizador externo (vLLM, TGI) siempre que su compatibilidad con el esquema de tokens especiales se valide manualmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación se establece con otros tokenizadores de vocabulario comparable, ya que no existen alternativas de la misma categoría publicadas por el mismo autor.

| Tokenizador | Vocabulario | Algoritmo | Tokens especiales destacados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SymbTokenizer (GRRNMAKE) | 128.256 | BPE | BOS 128000, EOS 128009, cabeceras 128006/128007, eom 128008 | CPSL 1.0 (propietaria) | Hugging Face, 0 descargas |
| Tokenizador de Llama 3 | 128.256 | BPE (tiktoken) | Mismo esquema de IDs 128000-128009 | Llama 3 Community License | Ampliamente disponible |
| Tokenizador de Qwen2.5 | 151.643 | BPE | Esquema propio | Apache 2.0 (mayoría de variantes) | Ampliamente disponible |
| Tokenizador de Mistral | 32.000 / 131.072 según versión | BPE (SentencePiece en versiones antiguas) | Esquema propio | Apache 2.0 | Ampliamente disponible |

La coincidencia de vocabulario y de IDs especiales con Llama 3 es el dato más relevante de la comparativa: sugiere reutilización del esquema, pero la licencia CPSL 1.0 es propietaria y más restrictiva que Apache 2.0, lo que condiciona su adopción frente a alternativas abiertas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no puede evaluarse con MMLU, HumanEval o GSM8K. Cualquier expectativa de rendimiento debe dirigirse a Chíìkè, Dúdú o al modelo SYNAXIM correspondiente.
- La licencia CPSL 1.0 es propietaria y el texto completo solo está en el archivo `LICENSE` del repositorio; no se detallan en la información disponible las restricciones de uso comercial, redistribución o modificación. Es imprescindible leerla antes de integrar el tokenizador en un producto.
- El repositorio registra 0 descargas y 0 likes, con tamaño de 0.0 GB y fecha de creación en noviembre de 2026: la madurez y el soporte del proyecto no pueden verificarse.
- La cobertura multilingüe está declarada pero no cuantificada; no hay datos de fertilidad por idioma ni de manejo de alfabetos no latinos.
- El límite de 131.072+ tokens es una declaración del autor sobre el contexto del modelo consumidor, no una propiedad verificable del tokenizador.
- No se documenta el corpus de entrenamiento del BPE, por lo que no es posible evaluar sesgos de vocabulario ni cobertura de dominios técnicos.
- La API nativa `chike_symb_inference` no está publicada como paquete verificable en la información disponible; su disponibilidad real en PyPI o similar no se confirma.
- Riesgo de desalineación: si el modelo SYNAXIM espera un vocabulario distinto del publicado, los IDs especiales coincidentes con Llama 3 pueden dar una falsa sensación de compatibilidad. Validar siempre con una prueba de encode/decode de ida y vuelta antes de desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GRRNMAKE/SymbTokenizer
- Licencia (referenciada en la model card, dentro del repositorio): https://huggingface.co/GRRNMAKE/SymbTokenizer/blob/main/LICENSE
- Documentación de `tokenizers` (Hugging Face): no disponible en la información proporcionada
- Paper, blog o demo del runtime SYNAXIM: no disponible
- Repositorio del paquete `chike_symb_inference`: no disponible
