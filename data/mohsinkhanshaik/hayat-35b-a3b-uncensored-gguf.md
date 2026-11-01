# Mohsinkhanshaik/HAYAT-35B-A3B-Uncensored-GGUF

## Resumen

HAYAT 35B-A3B Uncensored (GGUF) es una distribución cuantizada del modelo Qwen3.6-35B-A3B en su variante sin censura publicada por HauhauCS, empaquetada por Mohsinkhanshaik como cerebro principal del asistente local HAYAT para Windows. No se trata de un modelo nuevo: los pesos son idénticos al build de HauhauCS, que a su vez deriva del Qwen3.6-35B-A3B oficial de Qwen. El aporte original de este repositorio es el `Modelfile` de Ollama con instrucciones de sistema y parámetros de muestreo, más los ficheros GGUF listos para su uso local.

Arquitectónicamente es un transformer con mezcla de expertos (MoE) de 34.660.610.688 parámetros totales y aproximadamente 3B activos por token, lo que permite ejecutarlo en hardware modesto con un consumo de memoria contenido. El repositorio incluye el modelo de lenguaje en cuantización Q4_K_M (21,2 GB) y un proyector de visión en f16 (0,9 GB), lo que habilita entrada de imagen y texto.

Su relevancia actual radica en dos factores: la eficiencia del esquema MoE para despliegue en equipos de consumo y la orientación explícita a un uso local, privado y sin filtros de contenido, con licencia Apache-2.0. El autor reporta unas 178 descargas y cero likes en el momento de la consulta, lo que indica una adopción todavía muy incipiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según etiqueta `moe` del repositorio |
| Parámetros totales | 34.660.610.688 (34,66B) |
| Parámetros activos | Aproximadamente 3B por token (según model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (modelo de lenguaje) y f16 (proyector de visión); el repositorio se etiqueta con `imatrix` |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada de Qwen3.6-35B-A3B y del build de HauhauCS) |
| Formato de pesos | GGUF (modelo de lenguaje y proyector multimodal) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos: 34,66B parámetros totales con aproximadamente 3B activos por token. Esta configuración reduce el coste computacional por token en comparación con un modelo denso del mismo tamaño, a cambio de requerir mantener en memoria la totalidad de los pesos. El repositorio no documenta la composición del dataset de entrenamiento, el número de tokens procesados ni las etapas de alineación (RLHF, DPO u otras), por lo que esos datos deben considerarse no disponibles.

La innovación técnica documentada en este repositorio no está en el modelo en sí, sino en el empaquetado: los pesos se distribuyen en formato GGUF con cuantización Q4_K_M para el modelo de lenguaje y un proyector de visión separado en f16, junto con un `Modelfile` de Ollama que fija instrucciones de sistema y parámetros de muestreo. El autor indica explícitamente que los pesos no han sido modificados respecto al build de HauhauCS y que el único añadido es la receta de Ollama. La variante "Uncensored" procede del ajuste de HauhauCS sobre la base Qwen3.6-35B-A3B, sin que se detallen en la información disponible las técnicas concretas empleadas para eliminar los filtros de contenido.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a un asistente personal local.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`), mediante el proyector de visión incluido en el repositorio.
- Razonamiento y respuesta sobre temas sin restricciones de contenido declaradas, según la naturaleza "uncensored" del build.
- Instrucción explícita en el `Modelfile` para admitir desconocimiento y no inventar números, leyes, citas ni acciones completadas.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y despliegue mediante Ollama.
- No se documenta en la información disponible soporte de tool calling, function calling, modo thinking, audio ni capacidades de agente multi-paso.

## Casos de uso

- Asistente personal local en Windows: el modelo se integra mediante `ollama create hayat -f Modelfile` y `ollama run hayat`, ofreciendo conversación privada sin salida de datos a servicios externos, con un consumo medido de unos 22 GB de RAM en el equipo de referencia.
- Análisis de imágenes en local: gracias al proyector de visión en f16, puede recibir capturas de pantalla, fotografías o documentos escaneados y responder preguntas sobre su contenido sin conexión.
- Despliegue en portátiles con GPU de gama media: con 8 GB de VRAM y 42 GB de RAM, el autor reporta unos 31 tokens por segundo, lo que lo hace viable para uso interactivo en un RTX 5060 Laptop.
- Investigación sobre alineación y censura: al ser una variante sin filtros sobre una base Qwen, sirve para estudiar el comportamiento de modelos desinhibidos frente a sus versiones alineadas, siempre con las salvaguardas legales y éticas correspondientes.
- Prototipado de asistentes con requisitos de privacidad estrictos: sectores como sanidad, legal o defensa pueden requerir inferencia estrictamente local, y este empaquetado facilita la puesta en marcha con Ollama sin infraestructura adicional.
- Experimentación con arquitecturas MoE en hardware de consumo: la relación entre parámetros totales y activos permite estudiar el equilibrio entre calidad y latencia en entornos con memoria limitada.
- Base para fine-tuning o adaptación con instrucciones propias: al ser Apache-2.0 y distribuirse en GGUF, puede servir de punto de partida para recetas personalizadas, editando el bloque `SYSTEM` del `Modelfile`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento medido es empírico y de un solo equipo: aproximadamente 31 tokens por segundo en una RTX 5060 Laptop GPU con 8 GB de VRAM y 42 GB de RAM, con unos 22 GB de RAM en uso y una carga en frío de unos 23 segundos.

## Requisitos de hardware

- VRAM estimada: el modelo completo en Q4_K_M ocupa 21,2 GB; el proyector de visión añade 0,9 GB. Con 8 GB de VRAM el autor reporta funcionamiento correcto, lo que implica que parte de las capas se descargan a RAM del sistema.
- RAM recomendada: al menos 22 GB en uso según la medición del autor; se recomienda 32 GB o más para margen operativo.
- GPU recomendadas: RTX 5060 Laptop (medida por el autor); por capacidad de VRAM, tarjetas con 16-24 GB (RTX 4080/4090, A100 40 GB, H100) permitirían mantener más capas en GPU y reducir la dependencia de RAM.
- Cabe en GPU de consumo: sí, con descarga parcial a RAM; en tarjetas de 24 GB podría residir íntegramente en VRAM.
- Opciones de despliegue: Ollama es el método documentado (con el `Modelfile` incluido); al ser GGUF, es compatible con llama.cpp y otros runners que soporten este formato.
- Latencia y throughput: aproximadamente 31 tokens por segundo y carga en frío de unos 23 segundos en el hardware de referencia; no hay datos para otros equipos.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| HAYAT 35B-A3B Uncensored (este) | 34,66B | ~3B | No disponible | Apache-2.0 | GGUF | Build sin censura de Qwen3.6-35B-A3B, empaquetado para Ollama |
| Qwen3.6-35B-A3B (base) | 35B | ~3B | No disponible | Apache-2.0 | No disponible en la información | Modelo original de Qwen, presumiblemente alineado |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | 35B | ~3B | No disponible | Apache-2.0 | No disponible en la información | Build sin censura del que derivan estos pesos |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Modelo sin censura: la variante "Uncensored" elimina los filtros de contenido, lo que implica riesgo de generar material ofensivo, ilegal o dañino; el usuario es responsable del uso.
- Riesgo de alucinación: el propio autor advierte de que el modelo puede equivocarse pese a las instrucciones del `Modelfile` de no inventar datos.
- Idiomas soportados no documentados: no se especifica qué lenguas cubre ni su calidad relativa.
- Longitud de contexto no disponible: no se puede planificar el uso en tareas de contexto largo sin este dato.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- El `Modelfile` está escrito para el asistente personal de un autor concreto y se dirige a él por su nombre; debe editarse el bloque `SYSTEM` antes de reutilizarlo.
- Adopción muy baja (178 descargas, 0 likes) y repositorio creado y actualizado el mismo día, lo que sugiere falta de validación comunitaria.
- Aunque la licencia es Apache-2.0, el uso comercial de un modelo sin censura puede acarrear obligaciones legales adicionales según jurisdicción y sector.
- Dependencia de hardware: con 8 GB de VRAM se requiere descarga a RAM, lo que limita el throughput en equipos con menos de 22 GB de RAM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mohsinkhanshaik/HAYAT-35B-A3B-Uncensored-GGUF
- Modelo base (build sin censura de HauhauCS): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Proyecto HAYAT: https://github.com/mohsinkhanshaik/HAYAT
