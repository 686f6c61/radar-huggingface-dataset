# GRRNMAKE/SymTokinzer

## Resumen

SymTokinzer es un tokenizador rápido publicado por el usuario GRRNMAKE bajo el identificador `GRRNMAKE/SymTokinzer`. No se trata de un modelo de lenguaje, sino de un componente de tokenización asociado al runtime propietario SYNAXIM y al contenedor binario nativo `.symb`, empleado por los modelos de razonamiento agéntico Chíìkè y Dúdú. Su función es convertir texto en secuencias de identificadores para esos modelos y aplicar la plantilla de chat con los tokens especiales que el runtime espera.

Técnicamente es un tokenizador de tipo Byte-Pair Encoding (BPE) con un vocabulario de 128.256 entradas, lo que lo sitúa en el rango de los tokenizadores de modelos frontera actuales. Declara soporte de contexto de hasta 131.072 tokens o más, aunque esa cifra corresponde al límite del modelo que consume el tokenizador, no a una propiedad intrínseca del propio tokenizador. El repositorio tiene un tamaño de 0,0 GB y registra cero descargas y cero likes en el momento de la consulta.

La relevancia de esta ficha es limitada pero concreta: quien pretenda ejecutar los modelos Chíìkè o Dúdú sobre SYNAXIM necesita este tokenizador para que la tokenización coincida exactamente con la del entrenamiento. Para cualquier otro uso, no hay evidencia publicada de que el tokenizador sea compatible con modelos de terceros, y la información disponible sobre el runtime y los modelos asociados es muy escasa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Byte-Pair Encoding (BPE), tokenizador rápido con backend Rust |
| Parámetros totales | no disponible (no es un modelo de lenguaje) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | hasta 131.072+ tokens (límite declarado del modelo consumidor) |
| Tipos de cuantización | no disponible (no aplica a un tokenizador) |
| Idiomas soportados | en, multilingual (según metadatos) |
| Licencia | apache-2.0 |
| Formato de pesos | tokenizer.json y ficheros auxiliares de tokenizador (no safetensors ni GGUF) |

Datos adicionales declarados en la model card: tamaño de vocabulario de 128.256 entradas y tokens especiales con identificadores fijos, entre ellos `<|begin_of_text|>` (128000), `<|end_of_text|>` (128001), `<|start_header_id|>` (128006), `<|end_header_id|>` (128007), `<|eom_id|>` (128008) y `<|eot_id|>` (128009).

## Arquitectura y entrenamiento

El tokenizador emplea BPE, el algoritmo estándar en la mayoría de modelos transformer contemporáneos, con una implementación rápida compatible con la librería `tokenizers` de Hugging Face y con `transformers` mediante `AutoTokenizer`. La model card no documenta el corpus de entrenamiento, el número de tokens vistos, la composición del vocabulario por idioma ni el criterio de selección de los merges. Tampoco se especifica si el vocabulario reserva rangos para tokens de código, de herramientas o de relleno más allá de los seis tokens especiales listados.

La innovación declarada no está en el algoritmo de tokenización, sino en su integración con el runtime SYNAXIM y con el formato binario `.symb`. La model card menciona un paquete de inferencia nativo (`chike_symb_inference`) con una clase `CozetTokenizer` que encapsula la tokenización para los modelos Chíìkè y Dúdú. No hay información pública sobre si ese paquete está disponible, bajo qué licencia se distribuye ni qué dependencias requiere. Tampoco se documenta si el tokenizador incluye decodificación especulativa, atención lineal u otras optimizaciones, extremo que carece de sentido en un tokenizador.

## Capacidades

- Conversión de texto a identificadores mediante BPE con vocabulario de 128.256 entradas.
- Aplicación de plantilla de chat mediante `apply_chat_template`, con roles de sistema, usuario y asistente delimitados por `<|start_header_id|>`, `<|end_header_id|>`, `<|eom_id|>` y `<|eot_id|>`.
- Gestión de tokens de control para inicio y fin de secuencia (`<|begin_of_text|>`, `<|end_of_text|>`).
- Ejecución con backend Rust a través de la librería `tokenizers`, adecuada para pipelines de alta concurrencia.
- Compatibilidad declarada con el runtime SYNAXIM y los modelos Chíìkè y Dúdú.
- Soporte declarado de inglés y multilingüe, sin desglose de cobertura por idioma.
- No realiza generación de texto, razonamiento, código, matemáticas, visión, tool calling ni funciones de agente: es exclusivamente un tokenizador.

## Casos de uso

- Despliegue de los modelos Chíìkè o Dúdú sobre SYNAXIM: el tokenizador garantiza que la segmentación del texto de entrada coincide con la usada en el entrenamiento, condición necesaria para que las predicciones sean coherentes. Se usaría cargando `AutoTokenizer.from_pretrained("GRRNMAKE/SymTokinzer")` o el paquete nativo `CozetTokenizer`.
- Formateo de conversaciones multi-turno: `apply_chat_template` inserta los tokens de cabecera y de fin de turno que el runtime espera, lo que permite construir prompts de sistema, usuario y asistente de forma reproducible sin concatenar cadenas a mano.
- Servicios de inferencia de alta concurrencia: al usar el backend Rust de `tokenizers`, el coste de tokenización por petición es bajo y estable, lo que resulta adecuado para servidores que atienden muchas peticiones cortas.
- Preprocesado en pipelines de evaluación: para medir longitudes de secuencia, contar tokens o truncar entradas a 131.072 tokens antes de pasarlas a un modelo compatible con este vocabulario.
- Integración en herramientas de análisis de prompts: contar tokens y estimar coste o ventana consumida en aplicaciones que usen los modelos del ecosistema SYNAXIM.
- Verificación de compatibilidad en migraciones: comprobar que los identificadores de los tokens especiales (128000 a 128009) coinciden con los esperados por un checkpoint concreto antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un tokenizador, las métricas habituales de modelos (MMLU, HumanEval, GSM8K) no aplican; la model card no incluye mediciones de fertilidad del vocabulario, cobertura multilingüe ni latencia de tokenización.

## Requisitos de hardware

- VRAM: no aplica; un tokenizador no requiere GPU y se ejecuta en CPU con un consumo de memoria del orden de decenas de megabytes, coherente con un repositorio de 0,0 GB.
- GPU recomendadas: no aplica. La tokenización puede ejecutarse en cualquier CPU moderna.
- GPU de consumo: no aplica.
- Opciones de despliegue: `transformers` (`AutoTokenizer`), `tokenizers` con backend Rust y el paquete nativo `chike_symb_inference` (`CozetTokenizer`) para el runtime SYNAXIM.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Algoritmo | Tokens especiales documentados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SymTokinzer (GRRNMAKE) | 128.256 | BPE | 6 (BOS, EOS/PAD, cabeceras, fin de mensaje y de turno) | apache-2.0 | Hugging Face, 0 descargas |
| Tokenizadores de Llama 3 | 128.256 | BPE | familia `<|...|>` con cabeceras de rol | licencia Llama 3 | ampliamente distribuido |
| Tokenizadores de Mistral | 32.000 (v0.1) / 32.768 (v0.3) | BPE | BOS, EOS, `[INST]`, `[/INST]` | apache-2.0 | ampliamente distribuido |
| Tokenizadores de Qwen2 | 151.646 | BPE | familia ChatML | apache-2.0 | ampliamente distribuido |

La comparación se limita a características estructurales: la información disponible no permite comparar calidad de segmentación, fertilidad por idioma ni compatibilidad real con modelos de terceros. El solapamiento de tamaño de vocabulario y de esquema de tokens especiales con la familia Llama 3 es notable, pero no hay evidencia publicada de que los vocabularios sean idénticos ni intercambiables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni razona. Cualquier expectativa de uso como modelo queda fuera de su función.
- La información pública es mínima: no se documenta el corpus de entrenamiento, la composición lingüística del vocabulario ni el proceso de construcción de los merges.
- Cero descargas y cero likes registrados, con creación y actualización en la misma fecha, lo que impide evaluar su adopción o validación por terceros.
- El soporte multilingüe se declara en los metadatos sin desglose; no hay datos sobre fertilidad en idiomas distintos del inglés ni sobre cobertura del castellano.
- La compatibilidad con el runtime SYNAXIM y los modelos Chíìkè y Dúdú se afirma en la model card, pero no se aportan checkpoints, papers ni repositorios verificables de esos modelos.
- El paquete `chike_symb_inference` no figura documentado en canales públicos; su disponibilidad, licencia y seguridad no pueden verificarse.
- La licencia apache-2.0 permite uso comercial del tokenizador, pero no concede derechos sobre los modelos o el runtime propietarios con los que se integra.
- El límite de 131.072 tokens es una cifra declarada del modelo consumidor, no una garantía de que el tokenizador gestione secuencias de esa longitud sin degradación en el modelo.
- Riesgo de alucinación y sesgos: no aplica directamente al tokenizador, pero cualquier sesgo del vocabulario (por ejemplo, mayor granularidad para el inglés) se propagará al modelo que lo use.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GRRNMAKE/SymTokinzer
- Documentación de `tokenizers` (backend Rust): https://huggingface.co/docs/tokenizers
- Documentación de `AutoTokenizer` en transformers: https://huggingface.co/docs/transformers/main_classes/tokenizer
- Documentación de plantillas de chat: https://huggingface.co/docs/transformers/chat_templating
- Paper de referencia sobre BPE (Sennrich et al., 2016): https://arxiv.org/abs/1508.07909
- No se han encontrado papers, blogs, repositorios ni demos adicionales sobre SYNAXIM, Chíìkè o Dúdú en la información proporcionada.
