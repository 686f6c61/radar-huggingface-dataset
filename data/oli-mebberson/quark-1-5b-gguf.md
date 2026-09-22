# oli-mebberson/quark-1.5b-GGUF

## Resumen

Lattice Quark 1.5B GGUF es el paquete de cuantizaciones GGUF del modelo Lattice Quark 1.5B, un modelo de lenguaje decoder-only entrenado desde cero (no es un fine-tune de otro modelo base) por Oli Mebberson, publicado originalmente bajo el repositorio lattice-research/lattice-quark-1.5b. Este repositorio, oli-mebberson/quark-1.5b-GGUF, empaqueta el checkpoint SFT en cinco cuantizaciones para su uso con llama.cpp y aplicaciones locales.

El modelo tiene 1,5 mil millones de parámetros, arquitectura GPT-style tipo nanochat con 26 capas, anchura de embedding de 1536 y 12 cabezas de atención, ventana de contexto de 2048 tokens y vocabulario de 32.768 entradas con tokenizador BPE estilo tiktoken. Fue preentrenado con aproximadamente 2.000 millones de tokens del corpus SmolLM durante 1.500 iteraciones y posteriormente ajustado con instrucciones (SFT) durante 465 iteraciones con la plantilla `<|user_start|> ... <|assistant_start|>`.

Su relevancia es principalmente experimental y educativa: es un ejemplo de entrenamiento desde cero completamente abierto, con código de entrenamiento público, y este repositorio documenta de forma inusualmente detallada el proceso de conversión a GGUF y su verificación numérica. El principal obstáculo práctico es que la arquitectura nanochat es personalizada y llama.cpp en su versión estándar no carga estos ficheros: el repositorio incluye un parche y un bundle de Git con el árbol de llama.cpp ya probado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-style nanochat (decoder-only), 26 capas, anchura de embedding 1536, 12 cabezas |
| Parámetros totales | 1,5B |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); los checkpoints originales están en el repositorio del modelo base |
| Vocabulario | 32.768 tokens, BPE estilo tiktoken |
| Plantilla de chat | `<|user_start|> ... <|assistant_start|>` (incrustada en el GGUF) |
| Tamaño del repositorio | 7,8 GB |
| Descargas / likes | 44 descargas, 0 likes |

Tamaños exactos de cada cuantización publicados por el autor:

| Fichero | Tamaño | Respuesta de identidad en pruebas greedy |
|---|---:|---|
| `quark-1.5b-sft-Q4_K_M.gguf` | 892.415.072 bytes (0,85 GiB) | Respuesta genérica de asistente |
| `quark-1.5b-sft-Q5_K_M.gguf` | 1.053.338.720 bytes (0,98 GiB) | Respuesta genérica de asistente |
| `quark-1.5b-sft-Q6_K.gguf` | 1.224.320.096 bytes (1,14 GiB) | Respuesta genérica de asistente |
| `quark-1.5b-sft-Q8_0.gguf` | 1.585.439.840 bytes (1,48 GiB) | Conserva la respuesta entrenada de Lattice Quark |
| `quark-1.5b-sft-f16.gguf` | 2.983.322.688 bytes (2,78 GiB) | Conserva la respuesta entrenada de Lattice Quark (referencia) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de estilo GPT con una implementación propia denominada nanochat, con 26 capas, anchura de embedding de 1536 y 12 cabezas de atención. El modelo se entrenó desde inicialización aleatoria, no mediante fine-tuning sobre otro modelo base. El preentrenamiento consumió aproximadamente 2.000 millones de tokens del corpus SmolLM a lo largo de 1.500 iteraciones, y la fase de ajuste por instrucciones se extendió 465 iteraciones usando la plantilla de conversación `<|user_start|> ... <|assistant_start|>`. El tokenizador es un BPE de 32.768 entradas de estilo tiktoken.

La innovación técnica relevante no está en el modelo en sí, sino en el proceso de portado: la arquitectura nanochat no es soportada por llama.cpp estándar, por lo que el autor publica un parche de arquitectura independiente (`quark-nanochat-llamacpp.patch`), un bundle de Git clonable con el árbol de llama.cpp probado (`quark-llama-cpp.bundle`) y el convertidor empleado en la release (`convert_to_GGUF.py`), además de notas de compilación, integración y verificación (`NOTES.md`). La conversión se validó en varios niveles: coincidencia byte a byte del tokenizador con el original en ocho cadenas de prueba, coincidencia de 24 de 24 identificadores de token en decodificación greedy frente a la referencia, y comprobación de sumas SHA-256 de los artefactos. No se documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto en inglés y conversación multi-turno básica, con una ventana de contexto de 2048 tokens.
- Seguimiento de instrucciones simples gracias al ajuste SFT con plantilla de chat propia.
- Escritura de código sencillo: el autor indica que las explicaciones sobre gravedad y el código de Fibonacci se mantuvieron coherentes en las compilaciones Q4_K_M, Q5_K_M y Q8_0 probadas.
- Explicaciones divulgativas breves sobre conceptos generales (por ejemplo, gravedad), según las pruebas del autor.
- Preservación de la identidad entrenada del modelo únicamente en Q8_0 y f16; en Q4_K_M, Q5_K_M y Q6_K la identidad deriva hacia respuestas genéricas de asistente.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no, el modelo está etiquetado únicamente para inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación educativa sobre entrenamiento desde cero: permite reproducir el pipeline completo de un modelo pequeño (preentrenamiento, SFT, conversión a GGUF) partiendo del código público en olii-dev/nano-gpt, con la ventaja de que todas las etapas están documentadas.
- Investigación sobre cuantización e identidad de modelo: la sensibilidad de la respuesta de identidad a la cuantización (se pierde en Q4_K_M, Q5_K_M y Q6_K, se conserva en Q8_0 y f16) lo convierte en un caso de estudio útil para medir cómo afecta la cuantización a comportamientos concretos más allá de la perplejidad.
- Asistente conversacional local de bajo consumo: con 0,85 GiB en Q4_K_M puede ejecutarse en CPU o en GPU de gama de entrada, útil para demostraciones de chat sin conexión en portátiles modestos o dispositivos edge.
- Validación de portados de arquitecturas personalizadas a llama.cpp: el repositorio sirve como referencia práctica de parche, bundle y convertidor para llevar una arquitectura no soportada al ecosistema GGUF.
- Generación de texto corto en pipelines offline: redacción de borradores, resúmenes de fragmentos breves o texto de relleno donde no se requiera precisión factual, aprovechando su reducido coste de inferencia.
- Pruebas de integración y humo (smoke tests) en aplicaciones que consumen GGUF: sirve para verificar que una build de llama.cpp con soporte nanochat carga modelos, aplica plantillas de chat y genera tokens coherentes antes de pasar a modelos mayores.
- Docencia y talleres sobre cuantización: las cinco builds publicadas con tamaños exactos permiten ilustrar el compromiso entre tamaño de fichero, fidelidad de pesos y comportamiento observable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones estándar equivalentes). El autor solo publica métricas internas de verificación de la conversión, que se recogen aquí como tales y no como benchmarks de capacidad:

| Métrica de verificación | Resultado |
|---|---|
| Coincidencia del tokenizador con el original | Coincidencia byte a byte en 8 cadenas de prueba |
| Test de referencia extremo a extremo | 24 de 24 identificadores de token greedy coincidentes |
| NLL media (llama.cpp) | 6,2510 |
| NLL media (referencia) | 6,2498 |
| Comprobación de sumas SHA-256 | Verificada tras copiar los artefactos a almacenamiento |

El autor advierte explícitamente de que la debilidad aritmética del modelo persiste incluso en Q8_0, y que puede divagar o responder de forma incorrecta; lo describe como una limitación del modelo y no como un defecto de las cuantizaciones pequeñas.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos más caché KV completa de 2048 tokens en f16, calculada a partir de la arquitectura declarada de 26 capas y 12 cabezas; la caché KV ronda los 0,33 GB):
  - f16: aproximadamente 3,1-3,5 GB.
  - Q8_0: aproximadamente 1,8-2,2 GB.
  - Q6_K: aproximadamente 1,5-1,8 GB.
  - Q5_K_M: aproximadamente 1,3-1,6 GB.
  - Q4_K_M: aproximadamente 1,2-1,5 GB.
- Los pesos se pueden ejecutar también en CPU con llama.cpp: en Q4_K_M el fichero ocupa 0,85 GiB, por lo que es viable en máquinas con poca memoria (el ejemplo de compilación del autor usa `-DGGML_METAL=ON`, orientado a Mac con Metal).
- Cabe con holgura en cualquier GPU de consumo actual: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, así como en iGPU y Apple Silicon. No requiere GPU de centro de datos (A100, H100) salvo por agregación de muchas instancias.
- Opciones de despliegue: llama.cpp (obligatorio con el parche nanochat incluido; el árbol probado se restaura con `git clone quark-llama-cpp.bundle llama.cpp` y una compilación con CMake), `llama-cli` en modo conversación (`-cnv -c 2048`). vLLM y TGI no soportan la arquitectura. Ollama y otras herramientas basadas en llama.cpp estándar no cargarán los ficheros sin aplicar el parche.
- Latencia y throughput estimados: no disponibles (el autor no publica cifras).

## Comparativa con modelos similares

No existen benchmarks comparativos directos publicados para Quark 1.5B, por lo que la comparación de rendimiento no está disponible. La tabla siguiente contrasta especificaciones declaradas; los datos de Quark proceden de la información del repositorio y los de los modelos alternativos, de sus model cards públicas habituales.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| Lattice Quark 1.5B GGUF | 1,5B | 2048 | MIT | GGUF en este repositorio; requiere llama.cpp parcheado |
| Qwen2.5-1.5B | 1,5B | 32.768 | Apache-2.0 | Amplia, con soporte estándar en llama.cpp, vLLM y Ollama |
| SmolLM2-1.7B | 1,7B | 8192 | Apache-2.0 | Amplia, soporte estándar en el ecosistema |
| TinyLlama-1.1B | 1,1B | 2048 | Apache-2.0 | Amplia, soporte estándar en el ecosistema |

La diferencia más relevante no está en el tamaño, sino en la madurez: Quark es un modelo entrenado desde cero con unos 2.000 millones de tokens, sin benchmarks públicos y con una arquitectura que exige una build parcheada, frente a alternativas del mismo orden de parámetros con contexto mayor, soporte nativo en las herramientas habituales y evaluaciones publicadas.

## Limitaciones y advertencias

- Debilidad aritmética reconocida por el autor: el modelo comete errores de cálculo incluso en Q8_0; no debe usarse para decisiones que requieran respuestas numéricas o factuales fiables.
- Riesgo de alucinación: el autor advierte de que puede divagar y afirmar información falsa con seguridad.
- Sensibilidad de la identidad a la cuantización: en Q4_K_M, Q5_K_M y Q6_K el modelo abandona la respuesta entrenada a "Who are you?" y responde como asistente genérico; solo Q8_0 y f16 la conservan.
- Contexto limitado a 2048 tokens, muy inferior al de modelos contemporáneos del mismo tamaño, lo que restringe conversaciones largas y documentos extensos.
- Idioma: solo inglés etiquetado; no hay soporte declarado de castellano ni de otros idiomas.
- Dependencia de tooling no estándar: llama.cpp de serie no carga estos GGUF; es necesario aplicar el parche de arquitectura o clonar el bundle incluido. Esto complica el despliegue en producción y el uso con Ollama, vLLM o TGI.
- Volumen de entrenamiento reducido (unos 2.000 millones de tokens), lo que limita el conocimiento factual y la robustez frente a alternativas entrenadas con órdenes de magnitud más de datos.
- Validación comunitaria escasa: 44 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes publicadas.
- Licencia MIT: permisiva y apta para uso comercial, sin restricciones de atribución más allá de las habituales de la propia licencia; conviene revisar igualmente las condiciones del modelo base y del corpus SmolLM empleado en el preentrenamiento.
- Tamaño del repositorio de 7,8 GB, que incluye el bundle de Git y el parche además de los cinco GGUF.
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo: los enlaces encontrados correspondían a entidades no relacionadas, por lo que no se ha podido contrastar la información con fuentes externas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/oli-mebberson/quark-1.5b-GGUF
- Modelo base (checkpoints originales y model card de origen): https://huggingface.co/lattice-research/lattice-quark-1.5b
- Código de entrenamiento (nano-gpt): https://github.com/olii-dev/nano-gpt
- Demos y otros modelos Lattice: https://lattice.mebbo.cloud
- Perfil del autor en HuggingFace: https://huggingface.co/oli-mebberson
- Ficheros incluidos en el repositorio GGUF (rutas relativas al propio repositorio): `quark-llama-cpp.bundle`, `quark-nanochat-llamacpp.patch`, `convert_to_GGUF.py`, `NOTES.md`
- Resultados de búsqueda web: no se encontraron fuentes relevantes sobre este modelo; los resultados obtenidos correspondían a entidades no relacionadas y se han descartado.
