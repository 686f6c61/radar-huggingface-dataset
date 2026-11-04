# aaiiaxom/indicxlit-roman-to-bodo-onnx-int8

## Resumen

IndicXlit Roman → Bodo (ONNX, INT8) es un modelo de transliteración de escritura latina (romana) a bodo/boro en escritura devanagari. Se trata de una exportación a ONNX y cuantización a INT8 del modelo IndicXlit desarrollado por AI4Bharat (IIT Madras), empaquetada por el proyecto Assam AI Initiative (AAII) para su uso completamente en dispositivo, sin servidor ni dependencias de PyTorch o fairseq en inferencia.

El modelo resuelve un problema muy concreto: permitir que usuarios que escriben bodo con caracteres latinos (por ejemplo, en un teclado fonético o en una app de dictado por voz) obtengan la representación correcta en devanagari. Es la alternativa ligera al modelo original de fairseq, con un tamaño total de pesos de aproximadamente 14,4 MB (6,1 MB el codificador y 8,3 MB el decodificador), lo que lo hace apto para navegador, Android y Python embebido.

Su relevancia actual radica en que demuestra un patrón de despliegue de traducción/transliteración neuronal en el borde (edge), con latencias de 4 a 20 ms por palabra en un solo hilo de CPU, y con una licencia MIT que facilita su integración en productos comerciales. No es un modelo generativo de propósito general: es un transliterador palabra a palabra de ámbito acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (fairseq original, exportado a ONNX); dimensión de modelo 256 según la salida del codificador |
| Parametros totales | no disponible (pesos INT8: 6,1 MB codificador + 8,3 MB decodificador, ~14,4 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; decodificación limitada a `max_len=64` tokens de salida en los ejemplos; entrada palabra a palabra |
| Tipos de cuantizacion | INT8 dinámica (dynamic INT8) sobre ONNX; no se publican otros formatos |
| Idiomas soportados | bodo/boro (`brx`) como destino en devanagari; entrada en escritura latina (`en` como etiqueta de idioma de origen) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`) más JSON de vocabularios y configuración |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de IndicXlit de AI4Bharat: un transformer encoder-decoder con atención estándar y dimensión de modelo de 256, entrenado originalmente en fairseq sobre el corpus Aksharantar. El repositorio no reentrena ni modifica los pesos en precisión original; únicamente cambia la serialización (fairseq → ONNX) y la precisión numérica (fp32/fp16 → INT8 dinámica). El codificador recibe tokens de origen en INT64 y devuelve `encoder_out` de forma `[src_len, batch, 256]` junto con una máscara de padding; el decodificador es stateless, recibe los tokens previos y devuelve únicamente los logits de la última posición (`[batch, 806]`).

El modelo es de nivel de palabra: se divide la frase en secuencias de letras latinas y se conservan espacios, dígitos y puntuación sin modificar. El vocabulario de origen tiene 54 tokens (especiales, `a`–`z` y etiquetas de idioma, con `__brx__` en el índice 35) y el de destino 806 tokens compartidos entre todas las escrituras de IndicXlit. La decodificación es greedy con supresión de los índices de padding y desconocido. No se documentan en la información disponible detalles sobre volumen de tokens de entrenamiento, composición exacta del dataset Aksharantar para bodo, ni si hubo RLHF/DPO; al ser un transliterador supervisado, lo habitual es entrenamiento seq2seq con datos paralelos, pero este extremo no se confirma en la model card.

## Capacidades

- Transliteración palabra a palabra de escritura latina a bodo/boro en devanagari, con ejemplos verificados como `mwjang` → मोजां, `bathou` → बाथौ y `gwswni` → गोसोनि.
- Ejecución completamente en dispositivo: navegador con `onnxruntime-web`, Android y Python con `onnxruntime`, sin servidor ni PyTorch/fairseq en inferencia.
- Integración en teclados fonéticos mediante Web Worker para no bloquear el hilo de interfaz.
- Manejo de etiqueta de idioma de origen (`__brx__`) para condicionar la salida al destino bodo.
- Conservación de espacios, dígitos y puntuación al procesar frases completas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. Es un modelo especializado de transliteración, no un LLM generativo.

## Casos de uso

- Teclado fonético bodo en navegador: el modelo se ejecuta en un Web Worker con `onnxruntime-web` y convierte cada palabra escrita en latín a devanagari en 4–20 ms por palabra en un solo hilo de CPU, sin enviar pulsaciones a un servidor.
- App Android de dictado por voz en bodo: tras el reconocimiento de voz en latín, el transliterador convierte la transcripción a devanagari en el propio dispositivo, preservando la privacidad del usuario y funcionando sin conectividad.
- Normalización de texto para corpus lingüísticos: conversión por lotes de transcripciones romanizadas de bodo a devanagari para su indexación o publicación, usando el script de prueba incluido (`test_onnx_bodo.py`) con solo `onnxruntime` y `numpy`.
- Preprocesamiento en pipelines de NLP para bodo: alinear textos romanizados con recursos en devanagari antes de alimentar modelos de análisis morfológico o traducción automática.
- Herramientas de accesibilidad y educación: asistencia a hablantes de bodo que dominan la escritura latina pero no la devanagari, con corrección inmediata en editores de texto o formularios web.
- Despliegue en entornos con recursos mínimos: servidores sin GPU o dispositivos embebidos donde un modelo fairseq completo no cabría, gracias a los ~14,4 MB de pesos INT8 y a la API de ONNX Runtime.
- Integración en extensiones de navegador o PWA: al servirse los pesos desde Hugging Face o empaquetarse localmente, permite transliteración offline en aplicaciones web progresivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta una métrica de latencia orientativa: aproximadamente 4–20 ms por palabra en un solo hilo de CPU, sin especificar el hardware de referencia ni métricas de precisión (por ejemplo, accuracy a nivel de palabra o de carácter) frente al modelo original en fp32.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU. Los pesos INT8 ocupan ~14,4 MB en disco y una fracción similar en memoria durante la inferencia.
- GPU recomendadas: no disponibles ni necesarias; el modelo se ejecuta con `CPUExecutionProvider` de ONNX Runtime.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles y navegadores, pero no se documenta una ruta GPU específica.
- Opciones de despliegue: `onnxruntime` en Python, `onnxruntime-web` en navegador (recomendado en Web Worker), y potencialmente otros runtimes compatibles con ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 4–20 ms por palabra en un hilo de CPU según el autor; el throughput agregado no se documenta.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros / tamano | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| aaiiaxom/indicxlit-roman-to-bodo-onnx-int8 | Transliteración latín → bodo (devanagari) | ~14,4 MB INT8 | Palabra a palabra, salida máx. 64 tokens en ejemplos | MIT | ONNX Runtime, navegador, Android |
| aaiiaxom/indicxlit-roman-to-assamese-onnx-int8 | Transliteración latín → asamés | no disponible (mismo pipeline IndicXlit) | no disponible | MIT | ONNX Runtime, navegador, Android |
| AI4Bharat IndicXlit (original) | Transliteración multiescritura índica | no disponible en la información | no disponible | no disponible en la información | fairseq / PyTorch |

La comparativa se limita a las alternativas directamente relacionadas que aparecen en la información proporcionada. No se dispone de datos de benchmarks que permitan comparar precisión entre estas variantes.

## Limitaciones y advertencias

- Ámbito muy restringido: solo translitera latín → bodo; no es un modelo de propósito general y no debe usarse para generación de texto, código o razonamiento.
- Decodificación greedy sin modelo de lenguaje externo: puede producir transliteraciones ambiguas o incorrectas en palabras con múltiples romanizaciones válidas.
- Procesamiento palabra a palabra: pierde contexto entre palabras, lo que puede afectar a la coherencia en frases con contracciones o términos compuestos.
- Vocabulario de origen limitado a `a`–`z` en minúsculas (54 tokens); caracteres acentuados, dígitos dentro de palabras o mayúsculas no cubiertas se descartan o se conservan sin transliterar.
- No se documentan evaluaciones de sesgo ni de robustez; al ser un transliterador, el riesgo de alucinación se manifiesta como salidas plausibles pero incorrectas, no como texto inventado extenso.
- Licencia MIT: permite uso comercial, pero la atribución del trabajo de modelado corresponde a AI4Bharat (IIT Madras); conviene conservar la atribución en productos derivados.
- Los pesos están cuantizados a INT8 sin datos publicados de degradación de precisión frente al modelo original, por lo que en producción conviene validar con un conjunto propio de palabras bodo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado en 2026; no hay evidencia de uso en producción ni de mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aaiiaxom/indicxlit-roman-to-bodo-onnx-int8
- Modelo hermano (roman → asamés): https://huggingface.co/aaiiaxom/indicxlit-roman-to-assamese-onnx-int8
- Repositorio IndicXlit de AI4Bharat: https://github.com/AI4Bharat/IndicXlit
- AI4Bharat: https://ai4bharat.org
- Perfil del autor en Hugging Face: https://huggingface.co/aaiiaxom
