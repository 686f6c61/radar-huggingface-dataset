# NikitHamal/sakhiya-gguf

## Resumen

Sakhiya GGUF es un modelo de síntesis de voz (text-to-speech, TTS) de tamano muy reducido, con 6.315.401 parametros totales, desarrollado por NikitHamal y publicado en formato GGUF v3 para su uso con el motor propio del autor, escrito en C++17 y compilable a WebAssembly. El modelo esta disenado para generar audio a partir de texto en nepalí (ne) y sanscrito (sa), y se distribuye en varias variantes de tamano (v1, nano, atom y atom_lite), siendo la variante atom_lite la mas compacta, con tan solo 2,998,112 bytes (aproximadamente 3 MB) en cuantizacion Q8_0.

La relevancia de este modelo radica en su enfoque de despliegue: al ser un unico fichero GGUF ejecutado por un motor sin dependencias externas, puede integrarse en entornos con recursos muy limitados, como navegadores web (via WebAssembly), dispositivos Android (via JNI) o sistemas embebidos, sin necesidad de frameworks de inferencia pesados. Esto lo diferencia de los modelos TTS convencionales, que suelen requerir PyTorch y GPU.

La ficha se basa exclusivamente en la informacion disponible en Hugging Face y en la model card del autor. No se han publicado resultados de benchmarks en la informacion disponible, y varios parametros tecnicos (como la longitud de contexto o los tipos de cuantizacion mas alla de Q8_0 y FP16) no estan detallados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS (text-to-speech) con modelo acustico y vocoder; motor de inferencia GGML en C++17 / WASM |
| Parametros totales | 6.315.401 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (por defecto), Q8_0 exact (acustico FP32 + vocoder Q8_0), FP16 |
| Idiomas soportados | nepalí (ne), sanscrito (sa) |
| Licencia | other |
| Formato de pesos | GGUF v3 (ficheros unicos por tier) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de que se trata de un sistema TTS con un modelo acustico y un vocoder. La model card menciona que la variante Q8_0 exact combina un modelo acustico en FP32 con un vocoder en Q8_0, lo que sugiere una separacion entre la generacion de caracteristicas acusticas y la sintesis de forma de onda. El motor de inferencia es propio, escrito en C++17 (`cpp/sakhiya_ggml.hpp`), sin dependencias externas, y se distribuye como CLI (`sakhiya-cli`), biblioteca compartida (`libsakhiya.so`), modulo Android JNI y modulo WebAssembly (`sakhiya.wasm`).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card indica que la variante V1 en Q8_0 es "waveform-exact", es decir, que reproduce la forma de onda de referencia con precision, y que la variante Q8_0 exact alcanza un coseno de forma de onda mayor o igual a 0.999 respecto a la implementacion en PyTorch. Estos datos apuntan a un proceso de cuantizacion cuidadosamente validado, pero no a detalles del entrenamiento.

## Capacidades

- Sintesis de voz (TTS) a partir de texto en nepalí y sanscrito.
- Generacion de audio en un unico fichero GGUF, sin dependencias externas.
- Ejecucion en multiples entornos: CLI (`sakhiya-cli`), biblioteca compartida (`libsakhiya.so`), Android JNI y WebAssembly (`sakhiya.wasm`).
- Soporte de estilos de voz, segun el ejemplo de la model card (`style="news"`).
- Variantes de tamano para distintos presupuestos de recursos: v1, nano, atom y atom_lite.
- Precision de forma de onda validada: coseno mayor o igual a 0.999 en la variante Q8_0 exact respecto a PyTorch.
- No se dispone de informacion sobre tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Sintesis de voz en navegador web: mediante `sakhiya.wasm`, el modelo puede ejecutarse integramente en el cliente sin servidor, lo que permite generar audio en nepalí o sanscrito en aplicaciones web educativas o de accesibilidad sin enviar texto a un backend.
- Aplicaciones Android offline: a traves del modulo JNI, el modelo puede integrarse en apps de lectura de textos o asistentes de voz que funcionen sin conexion, gracias a su tamano reducido (aproximadamente 3 MB en atom_lite).
- Sistemas embebidos y dispositivos de bajo consumo: la variante atom_lite Q8_0, con 2,998,112 bytes, es adecuada para dispositivos con memoria limitada donde no cabe un stack de PyTorch.
- Generacion de avisos o noticias en nepalí: el estilo `news` del ejemplo de la model card sugiere su uso para locucion automatizada de boletines o alertas.
- Conservacion y difusion del sanscrito: el soporte del idioma sa permite generar pronunciacion de textos sanscritos para materiales educativos o liturgicos.
- Prototipado rapido de TTS en pipelines de CI/CD: al ser un unico fichero GGUF con checksums publicados (`SHA256SUMS.txt`), puede verificarse e integrarse en flujos automatizados de build y despliegue.
- Investigacion en TTS de bajos recursos: el modelo sirve como referencia para experimentar con cuantizacion Q8_0 y motores GGML en idiomas con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la fidelidad de forma de onda de la variante Q8_0 exact, con un coseno mayor o igual a 0.999 respecto a la implementacion en PyTorch, y la afirmacion de que la variante V1 en Q8_0 es waveform-exact.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del modelo (6.315.401 parametros, repo de 0.2 GB), la inferencia cabe holgadamente en memoria de cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no se especifican; dado el tamano, cualquier GPU moderna es suficiente, y el motor esta pensado para ejecucion en CPU y WASM.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual; tambien en CPU y en navegador.
- Opciones de despliegue: motor propio Sakhiya (`sakhiya-cli`, `libsakhiya.so`, Android JNI, `sakhiya.wasm`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (TTS en nepalí o sanscrito con despliegue GGML/WASM).

## Limitaciones y advertencias

- Idiomas limitados: solo nepalí (ne) y sanscrito (sa); no se documenta soporte de otros idiomas.
- Licencia "other": no se detallan los terminos exactos, por lo que es necesario revisar las condiciones antes de un uso comercial.
- Sin datos de benchmarks: no hay metricas publicas de calidad subjetiva (MOS) ni de inteligibilidad, lo que dificulta evaluar su rendimiento frente a alternativas.
- Sin informacion sobre sesgos: no se documentan sesgos conocidos ni la composicion del dataset de entrenamiento.
- Riesgo de alucinacion o errores de pronunciacion: no documentado; en TTS, la calidad depende de la cobertura fonetica del entrenamiento, que no se detalla.
- Dependencia del motor propio: el uso esta ligado al motor Sakhiya en C++17/WASM, lo que puede limitar la integracion con stacks convencionales de inferencia.
- Contexto: no se especifica la longitud maxima de texto de entrada.
- Repositorio con pocas descargas (310) y cero likes: ecosistema reducido, lo que puede implicar menor soporte comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/NikitHamal/sakhiya-gguf
- Repositorio del motor: https://github.com/NikitHamal/Sakhiya
- Fichero de checksums: `SHA256SUMS.txt` (incluido en el repositorio)
- Prebuilt Linux: `sakhiya-linux-x86_64.tar.gz` (CLI + libsakhiya.so + sakhiya.h)
- Prebuilt WASM: `sakhiya-wasm.tar.gz` (sakhiya.wasm + JS)
