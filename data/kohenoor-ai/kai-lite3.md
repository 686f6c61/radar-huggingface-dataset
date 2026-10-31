# KOHENOOR-AI/kai-lite3

## Resumen

KAIPAL Tales & Tunes (`kai-lite3`) es un modelo de generación de texto ligero, de unos 2 mil millones de parámetros (1.881.825.088 exactos), desarrollado por Kohenoor Technologies como tercera entrega de la serie KAIPAL. Está especializado en crear historias originales, rimas y bromas suaves para niños, y se diseña para ejecutarse completamente en local, sin GPU ni hardware costoso, sobre móviles antiguos con 6 GB de RAM o equipos de escritorio con 8 GB de RAM y procesador de 6 núcleos.

El problema que resuelve es doble: ofrecer un asistente narrativo infantil seguro y privado (todo funciona offline, sin enviar datos a ningún servidor) y hacerlo accesible en dispositivos de gama baja, algo poco habitual en modelos de lenguaje actuales. El modelo distribuye sus rimas desde una colección propia de 150 rimas originales y rechaza con delicadeza peticiones inseguras o poco amables, redirigiendo al niño a pedir ayuda a un adulto.

Técnicamente se distribuye en formato GGUF (cuantización q8_0, archivo de 1,9 GB), está pensado para ejecutarse vía Ollama y solo soporta inglés. Su relevancia está en el nicho de la IA infantil on-device: un caso de uso concreto, bien delimitado, con salvaguardas de seguridad integradas en su system prompt y parámetros de inferencia recomendados (temperatura 0,4, contexto de 4.096 tokens).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer de lenguaje, base no especificada) |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no se indica si es MoE; probablemente dense) |
| Longitud de contexto | 4.096 tokens (recomendado en el Modelfile) |
| Tipos de cuantizacion | q8_0 (GGUF) |
| Idiomas soportados | Inglés (unico idioma soportado; responde en inglés si se le pregunta en otro) |
| Licencia | Apache License 2.0 (con términos adicionales de Kohenoor Technologies para productos KAI) |
| Formato de pesos | GGUF (también listado con safetensors en el repositorio; tamaño total del repo: 2,0 GB) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura base ni el proceso de entrenamiento. Se trata de un modelo de generación de texto de aproximadamente 1,88 mil millones de parámetros, distribuido en un único archivo GGUF de 1,9 GB en cuantización q8_0, lo que sugiere un modelo dense (no MoE) afinado a partir de una base preentrenada, aunque la base concreta no se publica. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

Lo que sí documenta el autor es la capa de comportamiento: el modelo se controla mediante un system prompt incluido en el Modelfile, que define sus instrucciones de seguridad infantil, su colección de 150 rimas originales y sus reglas de redirección (sugerir pedir ayuda a un adulto para deberes, reparaciones o noticias). El autor enfatiza que un modelo de este tamaño "no se mantiene disciplinado" sin ese Modelfile, por lo que las instrucciones del system prompt son parte esencial del producto. Los hiperparámetros recomendados son temperatura 0,4, top-p 0,9, top-k 20, sin penalización por repetición y contexto de 4.096 tokens. El autor recomienda usar un motor de inferencia de octubre de 2026 o posterior.

## Capacidades

- Generación de historias originales bajo demanda: cuentos para dormir, aventuras, cuentos de hadas e historias interactivas con elecciones, usando personajes, nombres e ideas proporcionados por el usuario.
- Continuación y modificación de historias: continuar un relato, cambiar un personaje o convertir una historia existente en cuento para dormir.
- Recitado de rimas de su colección propia de 150 rimas originales, reproducidas palabra por palabra, sin tomar prestadas canciones de terceros.
- Composición de poemas nuevos a petición (con riesgo ocasional de inventar versos, según el propio autor).
- Conteo de bromas suaves aptas para niños, de una colección propia.
- Comportamiento seguro para niños: rechaza con amabilidad peticiones inseguras o poco amables y sugiere consultar a un adulto para deberes con sumas, reparaciones o noticias.
- Gestión multilingüe limitada: si se le pregunta en otro idioma, invita amablemente a continuar en inglés.
- Ejecución completamente local y offline, sin envío de datos externos.
- Distribución optimizada para Ollama, con soporte de la opción `--think=false`.

## Casos de uso

- Cuentos para dormir personalizados: un padre o madre introduce los nombres y personajes favoritos del niño y el modelo genera un cuento original cada noche, sin conexión y sin publicidad ni suscripciones.
- Aplicaciones infantiles en móviles antiguos: al requerir solo 6 GB de RAM y unos 2,1 GB de memoria en ejecución, puede integrarse en apps móviles que carguen GGUF, ofreciendo un compañero narrativo offline.
- Entretenimiento en viajes sin conectividad: al funcionar íntegramente en el dispositivo, es útil en aviones, coches o zonas sin cobertura, donde los asistentes en la nube no están disponibles.
- Recitado de rimas y poemas infantiles: educadores o cuidadores pueden pedir rimas de su colección de 150 composiciones originales, con la garantía de que no reproduce material con copyright de terceros.
- Herramienta de calma y humor: el modelo puede contar bromas suaves para niños, útil como distractor en contextos como esperas en consultas médicas o salas de niños.
- Entornos educativos con hardware limitado: en aulas o bibliotecas con ordenadores antiguos (8 GB de RAM, 6 núcleos), puede usarse como generador de material narrativo sin necesidad de conexión a internet ni GPUs.
- Exploración de IA local con privacidad total: para familias que no quieren que los datos de sus hijos salgan del dispositivo, es una opción donde ninguna conversación se envía a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica de rendimiento aportada por el autor es el consumo de memoria en ejecución: aproximadamente 2,1 GB de RAM usando solo CPU, sin GPU.

## Requisitos de hardware

- VRAM/RAM estimada: unos 2,1 GB de memoria en ejecución, medidos en CPU pura (sin GPU). El archivo del modelo ocupa 1,9 GB en disco.
- No se necesita GPU: el modelo está diseñado explícitamente para inferencia solo en CPU.
- Requisitos mínimos indicados por el autor: móviles con 6 GB de RAM o escritorios con 8 GB de RAM y procesador de 6 núcleos.
- Cabe con holgura en cualquier hardware consumer moderno; no requiere tarjetas dedicadas tipo RTX 4090 ni aceleradores de datacenter.
- Despliegue recomendado: Ollama (`ollama run kohenoor/kai-lite3 --think=false`), o creación local del modelo con el Modelfile incluido en el repositorio (`ollama create kai-lite3 -f Modelfile`).
- En apps móviles que carguen GGUF: usar el system prompt del Modelfile, temperatura 0,4, top-p 0,9, top-k 20, sin repeat penalty y contexto de 4.096 tokens, con un motor de inferencia de octubre de 2026 o posterior.
- Latencia y throughput: no disponibles (no se publican mediciones de tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| KAIPAL Tales & Tunes (kai-lite3) | ~1,88 B | 4.096 tokens | Apache 2.0 (+ términos KAI) | Narración infantil on-device, inglés | GGUF y Ollama |
| Llama 3.2 1B / 3B | 1,2 B / 3,2 B | 128.000 tokens | Llama Community License | Uso general, multilingüe (8 idiomas) | GGUF, Ollama, vLLM, etc. |
| Qwen2.5 1.5B | 1,5 B | 32.768 tokens | Apache 2.0 | Uso general, multilingüe (29+ idiomas) | GGUF, Ollama, vLLM, etc. |
| Gemma 2 2B | 2,6 B | 8.192 tokens | Gemma Terms of Use | Uso general, multilingüe | GGUF, Ollama, vLLM, etc. |

KAIPAL se diferencia de los modelos generales de tamaño similar en que no compite en benchmarks de razonamiento o código, sino en un nicho vertical: narración infantil segura, con salvaguardas integradas y huella de memoria mínima (2,1 GB frente a requisitos mayores en contextos largos de los modelos generales). A cambio, su ventana de contexto (4.096 tokens) es mucho menor que la de Llama 3.2 (128.000) o Qwen2.5 (32.768) y solo soporta inglés.

## Limitaciones y advertencias

- Solo inglés: el modelo rechaza amablemente conversaciones en otros idiomas y no tiene capacidades multilingües.
- Solo texto: no soporta visión, audio ni otras modalidades.
- Alucinaciones reconocidas por el propio autor: puede inventar versos al pedirle poemas nuevos, afirmar que no tiene más rimas de un tema cuando sí las tiene, o generar historias que no responden a lo pedido. Se recomienda supervisión adulta.
- Dependencia crítica del Modelfile: sin su system prompt y sus hiperparámetros (temperatura 0,4, top-p 0,9, top-k 20), el autor advierte de que el modelo pierde disciplina de comportamiento. No usarlo sin esas instrucciones.
- Contexto corto: 4.096 tokens limitan historias muy largas o conversaciones extensas.
- Licencia: aunque el modelo se distribuye bajo Apache 2.0, Kohenoor Technologies aplica sus propios términos adicionales para productos KAI, y las marcas KAI, KAIPAL y KAIPAL Tales & Tunes son propiedad de la empresa. Conviene revisar LICENSE y NOTICE antes de un uso comercial.
- Seguridad infantil: las salvaguardas dependen del system prompt, no de mecanismos de alineación documentados en el entrenamiento; no se han publicado evaluaciones de seguridad independientes.
- Proyecto de nicho con adopción muy temprana: 63 descargas y 1 like en HuggingFace en el momento de la ficha, sin comunidad ni auditorías externas conocidas.
- Requiere motor de inferencia de octubre de 2026 o posterior según el autor, lo que puede limitar la compatibilidad con despliegues existentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KOHENOOR-AI/kai-lite3
- Modelo en el registro de Ollama: https://ollama.com/kohenoor/kai-lite3
- KAI Full (versión completa, web de Kohenoor Technologies): https://www.kohenoor.net
