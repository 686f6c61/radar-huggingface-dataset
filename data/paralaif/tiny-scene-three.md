# paralaif/tiny-scene-three

## Resumen

Tiny Scene es un modelo de lenguaje minúsculo (4,85 millones de parámetros) entrenado desde cero por el desarrollador paralaif que traduce frases en inglés o español a un lenguaje de escena compacto, a partir del cual un intérprete procedural construye una escena 3D animada en three.js ejecutable íntegramente en el navegador. El modelo no genera geometría ni texturas: emite tokens estructurados (lugar, hora, clima, entidades con tipo, color, acción, relación, cámara) que un builder procedural convierte en objetos y animaciones sin shaders personalizados. La inferencia se realiza en JavaScript plano con una implementación propia del Transformer y caché KV, con un coste de aproximadamente 235 ms por frase en una sola hebra de Node.

El interés del proyecto es fundamentalmente arquitectónico y educativo: demuestra que una tarea de traducción de lenguaje natural a una representación estructurada puede resolverse con un modelo de menos de 5 M de parámetros entrenado en 18 minutos sobre una RTX 5060 Ti, sin dataset en disco (los pares se generan al vuelo desde plantillas) y con pesos de 9,7 MB en float16. Se inspira en WVY-Blender-5m en concepto (frase → lenguaje de escena → código procedural), pero sustituye Blender por three.js y no reutiliza código ni pesos del repositorio original.

Es relevante como referencia para quienes exploran modelos tiny especializados, inferencia en el cliente sin servidor, generación procedural de contenido 3D y sistemas editables de forma mixta (edición por texto y edición manual sobre la misma descripción de escena). No es un modelo de propósito general: su vocabulario de salida está cerrado a 235 tokens y su competencia se limita al dominio de escenas definido por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (6 capas, d=256, 8 cabezas, contexto 208) |
| Parametros totales | 4.852.480 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 208 tokens |
| Tipos de cuantizacion | float16 (pesos del navegador, 9,7 MB) y float32 (checkpoint PyTorch); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés y español |
| Licencia | MIT |
| Formato de pesos | `weights.bin` (float16, para el navegador) y `model.pt` (float32, checkpoint PyTorch) |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only de 6 capas con dimensión 256, 8 cabezas de atención y ventana de contexto de 208 tokens. La entrada se tokeniza a nivel de carácter con un alfabeto de 50 símbolos, lo que proporciona tolerancia a erratas y a acentos omitidos; la salida emplea un vocabulario fijo de tokens del lenguaje de escena, con un total de 235 tokens entre entrada y salida. La implementación de inferencia en el navegador replica el mismo Transformer en JavaScript plano con caché KV, y el repositorio incluye pruebas de paridad entre la implementación JS y PyTorch.

No existe dataset en disco: `gen.py` genera pares (frase → tokens) de forma ilimitada a partir de plantillas, introduciendo erratas y eliminación de acentos, de modo que cada lote de entrenamiento es nuevo. El modelo incluido se entrenó durante 14.000 pasos con lotes de 256, lo que supone aproximadamente 3,58 millones de pares, en 18 minutos sobre una RTX 5060 Ti. No se documenta uso de RLHF, DPO ni ajuste por preferencias; el entrenamiento es supervisado sobre datos sintéticos. La innovación principal no está en el modelo sino en el pipeline completo: lenguaje de escena intermedio, intérprete procedural en three.js, edición manual que modifica la misma descripción que escribe el modelo y exportación a `.glb` del fotograma actual.

## Capacidades

- Traducción de frases en inglés o español a un lenguaje de escena estructurado con lugar, hora, clima, entidades, acciones, relaciones, atributos y cámara.
- Creación de escenas nuevas a partir de una sola frase (por ejemplo, "an alien riding a horse on the moon" o "tres pingüinos caminando en la nieve mientras nieva").
- Edición incremental de la escena mediante frases: cambiar color, añadir o eliminar objetos, cambiar clima, mover cámara, con resolución de pronombres del tipo "make it yellow" sobre el objeto seleccionado.
- Catálogo cerrado de 54 objetos (animales, personajes, vehículos y props), 17 acciones, 8 relaciones, 15 lugares, 4 momentos del día, 5 estados meteorológicos, 5 encuadres y 6 movimientos de cámara.
- Atributos: 14 colores, 4 tamaños (más comparativos "bigger"/"smaller"), recuento de 2 a 6 y velocidad.
- Respuesta a 24 temas de preguntas sobre three.js y sobre la propia aplicación, con selección automática de idioma y tema; las respuestas se almacenan en `web/model/qa.json`.
- Tolerancia a erratas y a acentos omitidos gracias a la tokenización por carácter.
- No soporta tool calling, function calling ni razonamiento multi-paso general; no tiene visión, audio ni modo de pensamiento.

## Casos de uso

- Prototipado rápido de escenas 3D en el navegador: un diseñador escribe una frase y obtiene una escena animada editable en segundos, sin instalar Blender ni escribir código three.js, lo que acelera la exploración de composiciones y atmósferas.
- Herramienta educativa de three.js: las 24 respuestas integradas sobre la librería y la propia aplicación permiten usar el modelo como asistente contextual dentro de una demo docente, sin coste de API ni conexión a servidores.
- Generación procedural de contenido para demos y portfolios: el builder produce objetos y animaciones de forma determinista a partir de la descripción, lo que facilita escenas reproducibles para vídeos, capturas o presentaciones técnicas.
- Edición conversacional de escenas existentes: gracias a la mezcla de edición por texto y edición manual sobre la misma representación, un usuario puede seleccionar un objeto y pedir "make it yellow" o "remove the car", con deshacer y rehacer sobre todos los cambios.
- Pruebas de concepto de inferencia en el cliente: al ejecutarse en JavaScript con pesos de 9,7 MB, sirve como banco de pruebas para arquitecturas tiny en el navegador, incluyendo la validación de paridad entre implementaciones JS y PyTorch.
- Exportación de fotogramas a `.glb` para pipelines de render: el botón de exportación guarda el fotograma actual en un formato que abre en Blender, útil para llevar una composición generada por texto a un flujo de renderizado o postproducción.
- Investigación sobre traducción de lenguaje natural a lenguajes estructurados: el par generador/validador (`gen.py`, `check_scene.mjs`) sirve de plantilla para experimentos de text-to-X con vocabulario cerrado y datos sintéticos.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Frases nuevas del generador, limpias (3.000) | 99,93 % de salidas exactas |
| Frases nuevas del generador, con erratas (3.000) | 99,70 % |
| Frases escritas a mano fuera de plantillas (59, `tests/natural.json`) | 58 exactas |
| Paridad JavaScript vs PyTorch (300 frases) | 300 idénticas |
| Tiempo por frase en JavaScript (Node, una hebra) | ~235 ms |
| Escenas construidas sin errores (objeto × acción, lugar × hora × clima, relaciones) | 1.478 de 1.478 |

El propio autor advierte que las dos primeras filas miden frases con la misma gramática que el entrenamiento y son optimistas; la tercera es la más honesta, aunque la muestra es pequeña. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 (pesos de 9,7 MB) e inferior a 1 GB en float32 (checkpoint de unos 19,4 MB); el cuello de botella es el intérprete, no la memoria.
- GPU recomendadas: ninguna en particular; el modelo está pensado para ejecutarse en CPU dentro del navegador. Para reentrenar, el autor empleó una RTX 5060 Ti durante 18 minutos.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada, ya que la inferencia en producción es JavaScript en el cliente.
- Opciones de despliegue: servidor estático para la carpeta `web/` (por ejemplo, `python3 -m http.server 8080 --directory web`), inferencia por línea de comandos con `ml/infer.py` y entrenamiento con `ml/train.py`.
- Latencia y throughput: aproximadamente 235 ms por frase en Node con una sola hebra; no se documentan cifras de throughput por lote ni latencia en navegadores concretos.
- La página acepta los parámetros `?q=first prompt;second prompt&t=3` para ejecutar prompts al cargar y congelar el tiempo en un segundo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tiny Scene (paralaif) | 4,85 M | 208 | Frase → lenguaje de escena → three.js en navegador | MIT | Hugging Face, pesos float16 y float32 |
| WVY-Blender-5m (StarpowerTechnology) | ~5 M (según nombre) | no disponible | Frase → lenguaje de escena → Blender | no disponible en la información | Hugging Face |
| Modelos text-to-3D generativos (p. ej. basados en difusión) | cientos de millones a miles de millones | no disponible | Generación de mallas o NeRF | variable | múltiples repositorios |

La comparación directa con modelos text-to-3D generativos no es homogénea: Tiny Scene no genera geometría, sino una descripción estructurada que un builder procedural interpreta, lo que reduce drásticamente el tamaño y el coste, a cambio de un catálogo cerrado de objetos y acciones. WVY-Blender-5m es el referente conceptual más cercano, con la misma idea pero con Blender como backend.

## Limitaciones y advertencias

- Dominio cerrado: solo maneja los 54 objetos, 17 acciones, 8 relaciones, 15 lugares y atributos definidos en el léxico; cualquier petición fuera de ese catálogo no se resolverá correctamente.
- Contexto muy corto (208 tokens) y tokenización por carácter: frases largas o con estructuras complejas pueden truncarse o degradar la salida.
- El 99,93 % de exactitud está medido sobre frases generadas con la misma gramática que el entrenamiento; en frases naturales escritas a mano el resultado fue de 58 sobre 59, con una muestra pequeña y fallos documentados en casos como "a wide shot of…".
- Riesgo de alucinación limitado por el vocabulario cerrado, pero posible en la selección de tema para las preguntas de la sección de QA, donde el modelo elige entre 24 temas predefinidos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales; no es adecuado como modelo de propósito general.
- La licencia MIT permite uso comercial, pero el proyecto depende de three.js y de las respuestas almacenadas en `qa.json`, cuya exactitud no se ha validado de forma independiente.
- La exportación `.glb` guarda solo el fotograma actual: las animaciones son procedurales y no se exportan, lo que limita su uso en pipelines de animación.
- La interfaz está en español, aunque el modelo entiende inglés y español; la documentación y las pruebas están orientadas a ese entorno.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paralaif/tiny-scene-three
- Repositorio de referencia conceptual (WVY-Blender-5m): https://huggingface.co/StarpowerTechnology/WVY-Blender-5m
- Demo local: servir la carpeta `web/` del repositorio y abrir http://localhost:8080
- Tres.js: https://threejs.org
