# kyr0/cld3-pq-dno

## Resumen

`kyr0/cld3-pq-dno` es un paquete de pesos para identificación de idiomas (LID) derivado de Google CLD3, publicado por el desarrollador kyr0 bajo el paraguas del proyecto `defuss-lid`. No es un modelo neuronal generativo ni un transformer: es una versión fuertemente comprimida y reoptimizada de los pesos originales de CLD3, un clasificador de idioma basado en embeddings y una red densa pequeña, empaquetado para ejecutarse sobre el runtime WebAssembly de `cld3-asm` 4.0.0 sin modificaciones. Se distribuye en dos variantes, `major_20` (20 idiomas principales) y `full` (las 109 etiquetas de CLD3), con tamaños de ~110 kB y ~130 kB respectivamente.

La relevancia del paquete está en su método de compresión, denominado DNO-PQ (Direct Neural Optimization - Product Quantization): los embeddings se cuantizan por producto y las capas ocultas y softmax se reajustan sobre texto retenido partiendo de los pesos de Google, todo convertido a int8. El autor reporta que, lejos de degradarse, el modelo mejora al original en FP32: entre un 62 % y un 66 % menos de tamaño y entre un 14 % y un 90 % menos de errores de etiquetado según el idioma.

El caso de uso objetivo es la identificación de idioma en el edge y en el navegador, con un coste de descarga mínimo y sin dependencias de servidor. El paquete está pensado para integrarse en aplicaciones JavaScript/TypeScript mediante el runtime `defuss-lid`, que aporta una mejora adicional de puntuación basada en alfabetos (letter boost).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLD3 (clasificador con embeddings + capas densas ocultas y softmax), pesos en int8 con embeddings product-quantized |
| Parametros totales | no disponible (pesos de `full`: 130.548 bytes; `major_20`: 110.576 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (CLD3 opera sobre fragmentos de texto cortos; el benchmark evalúa primeros 20 code points y dos palabras) |
| Tipos de cuantizacion | int8 en capas ocultas y softmax; product quantization en embeddings |
| Idiomas soportados | `major_20`: en, de, fr, it, ru, id, es, pt, nl, ur, vi, th, zh, ja, pl, tr, ar, ko, bn, hi; `full`: las 109 etiquetas de CLD3 |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cld3q` (paquete propio de defuss-lid), cargado por runtime WASM (`cld3-core.bin.gz`) |

## Arquitectura y entrenamiento

El modelo subyacente es CLD3 de Google, un clasificador de idioma ligero que combina embeddings de características textuales con capas densas y una softmax sobre el conjunto de etiquetas de idioma. Sobre esa base, el autor aplica DNO-PQ: cuantización por producto de los embeddings y reajuste (refit) de las capas ocultas y softmax sobre texto retenido, partiendo de los pesos originales de Google y convirtiendo el resultado a int8. Los paquetes resultantes se ejecutan sobre el binario WebAssembly de `cld3-asm` 4.0.0 sin modificar.

El reajuste se realizó sobre datos de FLORES-200 y MASSIVE 1.1, según declara el autor, con conjuntos de ajuste y selección separados de los de evaluación. El benchmark de evaluación incluye FLORES-200 devtest (1.012 frases por idioma), los primeros 20 code points de esas frases, utterances de MASSIVE 1.1 y arranques de dos palabras (las dos primeras palabras distintas de cada frase del benchmark). La evaluación adicional usa el split de test de Tatoeba (20 % de frases por idioma) y NTREX-128 (hasta 1.000 frases de noticias por idioma). El autor afirma que ningún texto de benchmark se usó para ajustar o seleccionar el modelo.

La innovación destacable no es arquitectónica sino de compresión y ajuste: demostrar que un modelo LID clásico puede reducirse drásticamente y a la vez mejorar su precisión mediante reajuste dirigido sobre pesos cuantizados. El runtime añade una heurística de "letter boost" que suma a la puntuación del modelo la proporción de letras del texto que explica el alfabeto de cada idioma, con posibilidad de desactivarla (`{boost: false}`).

## Capacidades

- Identificación de idioma top-1 sobre texto corto y frases, con puntuación por idioma y flag `reliable`.
- Dos coberturas: 20 idiomas principales (`major_20`) o las 109 etiquetas de CLD3 (`full`).
- Funcionamiento en navegador, Node.js y bun mediante WebAssembly, sin backend.
- Letter boost opcional para refinar la predicción usando la cobertura de alfabeto del texto.
- Manejo de escrituras no latinas (chino, japonés, tailandés, árabe, etc.) mediante límites de palabra Unicode en la evaluación.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes: es exclusivamente un clasificador de idioma.
- Capacidad multilingüe limitada al conjunto de etiquetas CLD3; no cubre idiomas fuera de esas 109 etiquetas.

## Casos de uso

- Enrutamiento de idioma en aplicaciones web: detectar el idioma de la primera interacción del usuario en el cliente (navegador) y cargar el paquete de traducción o la configuración regional adecuada, con ~100 kB gzip y sin llamada a servidor.
- Moderación y filtrado en el edge: clasificar el idioma de mensajes entrantes en un worker de Cloudflare o similar para aplicar políticas específicas por idioma antes de reenviar a un servicio central.
- Preprocesado de pipelines NLP: etiquetar idioma en lotes de documentos o tickets de soporte antes de pasarlos a modelos mayores (traducción, resumen), reduciendo coste al evitar modelos multilingües grandes para la fase de enrutado.
- Anonimización y cumplimiento: detectar el idioma de textos para aplicar reglas de retención o redacción específicas por jurisdicción lingüística en el propio dispositivo del usuario.
- Aplicaciones móviles offline: integrar LID en apps React Native o PWA sin conexión, usando el runtime WASM y el paquete `major_20` para los 20 idiomas más comunes.
- Analítica de contenido multilingüe: clasificar comentarios, reseñas o titulares en un backend Node.js para agregar métricas por idioma, con throughput alto por el reducido coste computacional del clasificador.
- Detección temprana en formularios: identificar el idioma mientras el usuario escribe (arranques de dos palabras) para activar corrección ortográfica o sugerencias adecuadas, aprovechando la mejora reportada en textos muy cortos.

## Benchmarks y rendimiento

El autor publica resultados de precisión top-1 medidos con el build WebAssembly real. La información proporcionada incluye la tabla de `major_20` truncada; se recogen las filas disponibles sin completar datos no presentes.

| Slice | Filas | Google original | DNO-PQ | Errores vs Google | DNO-PQ, boost off | Errores vs Google, boost off |
|---|---:|---:|---:|---:|---:|---:|
| FLORES-200 devtest, frases | 20.240 | 99,64 | 99,94 | -81,9 % | 99,91 | -75,0 % |
| FLORES-200 devtest, primeros 20 code points | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| MASSIVE 1.1 test | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Arranques de dos palabras (benchmark) | no disponible | 80,88 | 90,23 | -49 % | no disponible | no disponible |

Datos adicionales reportados en la model card:

- Arranques de dos palabras en Tatoeba: reducción de errores del 61 % (`major_20`) y 24 % (`full`).
- Arranques de dos palabras en NTREX-128: reducción de errores del 33 % (`major_20`) y 14 % (`full`).
- Arranques de dos palabras en el benchmark propio: 90,23 % (`major_20`) y 75,26 % (`full`) frente a 80,88 % y 69,38 % de Google original.
- `full` incluye además evaluación sobre FLORES-200 devtest de los 19 idiomas CLD3 fuera de la cohorte del benchmark y texto romanizado sintético para las seis etiquetas `-Latn`; los valores concretos no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU mediante WebAssembly, sin GPU.
- Memoria: el paquete `major_20` ocupa ~110 kB (~99 kB gzip) y `full` ~130 kB (~117 kB gzip); el core WASM compartido pesa 188.549 bytes (108.233 gzip).
- GPU: no requiere ni se beneficia de GPU; el cuello de botella es la CPU del dispositivo.
- Cabe en cualquier dispositivo con un runtime JavaScript y soporte WASM: navegadores de escritorio y móviles, Node.js, bun, entornos edge.
- Despliegue: runtime `defuss-lid` (paquete npm), con `createCld3Pack`/`loadCld3Pack`; compatible con el binario de `cld3-asm` 4.0.0. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numérica en la información proporcionada; por el tamaño del modelo y la naturaleza del clasificador, se espera latencia de milisegundos en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamaño | Licencia | Ejecución |
|---|---|---|---|---|---|
| `kyr0/cld3-pq-dno` (`full`) | CLD3 + DNO-PQ, int8/PQ | 109 etiquetas | 130.548 B (116.637 B gzip) | Apache 2.0 | WASM (navegador, Node, bun) |
| Google CLD3 original (`full`) | CLD3, FP32 | 109 etiquetas | 366.028 B (343.197 B gzip) | no disponible en la información | WASM vía `cld3-asm` |
| `cld3-asm` 4.0.0 (bundle npm) | CLD3 WASM completo | 109 etiquetas | 1.058.372 B (516.234 B gzip) | no disponible en la información | WASM |
| fastText LID (lid.176) | Bolsa de n-gramas + clasificador lineal | 176 | no disponible en la información | no disponible en la información | nativo / bindings |

El paquete DNO-PQ reduce el peso de `full` un 64,3 % (66,0 % gzip) frente a los pesos originales de Google y un 69,8 % (56,4 % gzip) frente al bundle completo de `cld3-asm` 4.0.0, manteniendo o mejorando la precisión según los datos del autor. La comparación con fastText LID u otros detectores modernos no está cubierta en la información proporcionada.

## Limitaciones y advertencias

- Es un clasificador de idioma, no un modelo generativo: no produce texto ni razona; cualquier expectativa de LLM es incorrecta.
- La cobertura se limita a las etiquetas de CLD3 (109 en `full`, 20 en `major_20`); idiomas fuera de ese conjunto no se detectan correctamente.
- Las puntuaciones no son probabilidades calibradas, según advierte el propio autor.
- El letter boost es una heurística del runtime, no del modelo; desactivarlo cambia los resultados (las tablas muestran diferencias de varios puntos porcentuales).
- El rendimiento en textos muy cortos (dos palabras) es sensiblemente inferior al de frases completas, aunque el autor reporta mejoras sustanciales frente a Google original.
- Riesgo de confusión entre idiomas cercanos o con alfabetos compartidos; no se aportan matrices de confusión en la información disponible.
- Sesgos: no se documentan sesgos específicos; al ser un clasificador, los sesgos provendrían de la distribución de los datos de ajuste (FLORES, MASSIVE, Tatoeba, NTREX), no evaluados en detalle.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia de los pesos originales de Google CLD3 y del runtime `cld3-asm` antes de producción.
- El repositorio HuggingFace tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 2026-11-03) sin validación independiente conocida.
- El tamaño del repo es 0.0 GB; los pesos se distribuyen como archivos `.cld3q` referenciados en la model card, no necesariamente alojados en el repo de HuggingFace.
- Dependencia del runtime `defuss-lid` y del core WASM `cld3-core.bin.gz`; no es un modelo cargable con `transformers` ni con APIs estándar de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kyr0/cld3-pq-dno
- Repositorio del runtime: https://github.com/kyr0/defuss-lid
- Paquete npm: https://www.npmjs.com/package/defuss-lid
- Dataset FLORES-200: https://huggingface.co/datasets/facebook/flores
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive
- CLD3 (Google): no disponible en la información proporcionada
- `cld3-asm` 4.0.0: no disponible en la información proporcionada
