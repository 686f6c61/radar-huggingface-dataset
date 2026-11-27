# DICPlay/RusMind-3.2-Vspyshka

## Resumen

RusMind 3.2 Vspyshka (en ruso, «Вспышка», «destello») es un modelo de lenguaje afinado por DICPlay a partir de google/gemma-4-E4B-it. Se distribuye exclusivamente en formato GGUF y está pensado para inferencia local y sin conexión en ordenadores de gama alta y teléfonos insignia. El objetivo declarado es ofrecer un asistente conversacional en ruso para tareas cotidianas (correo, redacción, estudio, explicaciones) que no envíe datos a la nube.

El modelo forma parte de la familia RusMind 3.2, compuesta por Моментум (versión ligera para dispositivos modestos), Вспышка (esta ficha), Знание (en la nube) y АТОМ (en desarrollo, con tecnología propietaria Multi-Thinking). Según la model card, el ajuste se realizó sobre datos propios de DICPlay centrados en lengua y cultura rusas, historia y regiones de Rusia y legislación de la Federación Rusa.

El repositorio ocupa 25,2 GB e incluye varias cuantizaciones GGUF, además de una versión troceada en 14 partes de menos de 1 GB para su carga desde el navegador. El contexto declarado para la variante de navegador es de 4096 tokens. La licencia es propia (RusMind License), con uso comercial solo mediante contrato escrito con DICPlay.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de google/gemma-4-E4B-it; detalles internos no disponibles) |
| Parámetros totales | 7 518 069 290 (dato de safetensors del repo) |
| Parámetros activos | no disponible |
| Longitud de contexto | 4096 tokens (declarado para la versión de navegador; no se especifica para el resto de cuantizaciones) |
| Tipos de cuantización | Mini (~3,8 GB), Lite (~4,2 GB), Q4_K_M (5,3 GB), Q8_0 (8,0 GB); embeddings aligerados en la variante Mini |
| Idiomas soportados | Ruso (principal) e inglés |
| Licencia | RusMind License (DICPlay); modelo base bajo Apache 2.0 |
| Formato de pesos | GGUF (incluye versión troceada en 14 partes de hasta 1 GB) |

## Arquitectura y entrenamiento

La información disponible indica que RusMind Vspyshka es un fine-tuning de google/gemma-4-E4B-it, un modelo de Google publicado bajo Apache 2.0. No se detalla en la model card la arquitectura interna del modelo base (tipo de atención, uso de MoE, capas, vocabulario) ni el número exacto de tokens de entrenamiento empleados en el ajuste.

El ajuste se realizó, según el autor, sobre conjuntos de datos rusos propios de DICPlay: historia y cultura de Rusia, legislación, regiones y pueblos del país y valores familiares tradicionales, en ruso e inglés. No se especifica si hubo RLHF, DPO u otras etapas de alineación posteriores al fine-tuning supervisado, ni se documentan innovaciones técnicas propias más allá del empaquetado GGUF y la fragmentación para carga en navegador.

## Capacidades

- Generación de texto conversacional en ruso e inglés, orientada a tareas cotidianas: redacción de correos, textos, explicaciones y apoyo al estudio.
- Comprensión del contexto cultural ruso según los datos de ajuste declarados por el autor.
- Comportamiento declarado de abstención («no lo sé») cuando el modelo no está seguro, según la model card.
- Ejecución local y sin conexión mediante llama.cpp y aplicaciones compatibles con GGUF.
- Uso en navegador a través de la web rusmind.ru, con descarga única del modelo y funcionamiento posterior offline.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente personal offline en el escritorio: el modelo puede ejecutarse con llama.cpp u Ollama en un PC de gama alta y resolver consultas de redacción y estudio sin enviar datos a ningún servidor, lo que encaja con el enfoque de privacidad declarado por el autor.
- Redacción de correos y documentos en ruso: adecuado para usuarios que necesitan generar y corregir textos en ruso con registro formal, aprovechando el ajuste sobre lengua y cultura rusas.
- Apoyo al estudio y explicaciones: puede usarse como tutor local para explicar conceptos en ruso, con la ventaja de funcionar sin conexión en entornos con conectividad limitada.
- Consulta de referencia sobre legislación rusa: el ajuste incluye datos de legislación de la Federación Rusa, por lo que puede emplearse como apoyo informativo, siempre con la advertencia de que las respuestas jurídicas son de carácter orientativo.
- Despliegue en navegador para uso doméstico: la versión troceada en 14 partes permite cargar el modelo una vez en el navegador y usarlo después sin red, útil en equipos donde no se quiere instalar software adicional.
- Integración en aplicaciones de escritorio o móviles con llama.cpp/wllama: al distribuirse en GGUF, puede embeberse en aplicaciones que requieran un modelo local en ruso sin dependencia de API externas.
- Evaluación e investigación: la licencia permite uso gratuito para investigación y evaluación, lo que facilita su inclusión en estudios comparativos de modelos en ruso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según la cuantización: Mini ~3,8 GB, Lite ~4,2 GB, Q4_K_M ~5,3 GB, Q8_0 ~8,0 GB (tamaños de archivo; el consumo real en ejecución es algo superior por el contexto y el estado de la aplicación).
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU consumer con 8 GB o más (por ejemplo, RTX 3060/4060 en adelante) puede alojar las variantes Mini, Lite y Q4_K_M; Q8_0 requiere 8 GB o más de memoria libre.
- Compatibilidad con GPU consumer: sí, según los tamaños de archivo; el autor indica que la variante Mini está pensada para teléfonos y navegador, y Lite para teléfonos insignia y PC.
- Opciones de despliegue: llama.cpp (llama-cli con modo conversacional), LM Studio, Ollama, PocketPal, wllama y la web rusmind.ru.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RusMind 3.2 Vspyshka | 7 518 069 290 | 4096 (versión navegador) | RusMind License (comercial solo por contrato) | GGUF en Hugging Face |
| RusMind 3.2 Моментум | no disponible | no disponible | RusMind License | GGUF en Hugging Face |
| google/gemma-4-E4B-it (modelo base) | no disponible en la información | no disponible | Apache 2.0 | Pesos originales de Google |
| RusMind 3.2 Знание | no disponible | no disponible | RusMind License | En la nube (no abierto) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Vspyshka con el de Моментум, el modelo base u otras alternativas en ruso.

## Limitaciones y advertencias

- Sesgos: el ajuste se realizó sobre datos propios de DICPlay centrados en historia, cultura, legislación y «valores familiares tradicionales» de Rusia; esto puede introducir un sesgo editorial y cultural significativo en las respuestas.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad; como todo modelo generativo, puede producir información incorrecta, especialmente en materia jurídica, histórica o médica.
- Contexto limitado: 4096 tokens en la variante de navegador, insuficiente para documentos largos o conversaciones extensas; no se especifica si las demás cuantizaciones admiten más contexto.
- Idiomas: solo ruso e inglés; no hay soporte declarado de castellano ni de otros idiomas.
- Licencia restrictiva: el uso comercial, la redistribución, la publicación de versiones modificadas o afinadas y la integración en productos requieren contrato escrito con DICPlay; la licencia del modelo base es Apache 2.0, pero la licencia del fine-tuning es propia.
- Modelo «como está», sin garantías: el autor declara explícitamente que se proporciona sin garantía alguna.
- Advertencia del propio autor: las respuestas sobre medicina, derecho y finanzas son de carácter meramente informativo.
- Ausencia de datos técnicos: no se publican detalles de arquitectura, dataset, etapas de alineación ni benchmarks, lo que dificulta una evaluación rigurosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-3.2-Vspyshka
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de versiones anteriores: https://huggingface.co/DICPlay/RusMind-Vspyshka
- Demo web: https://rusmind.ru
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
- Archivo Mini: https://huggingface.co/DICPlay/RusMind-3.2-Vspyshka/blob/main/RusMind-Vspyshka-3.2-Mini.gguf
- Archivo Lite: https://huggingface.co/DICPlay/RusMind-3.2-Vspyshka/blob/main/RusMind-Vspyshka-3.2-Lite.gguf
- Archivo Q4_K_M: https://huggingface.co/DICPlay/RusMind-3.2-Vspyshka/blob/main/RusMind-Vspyshka-3.2-Q4_K_M.gguf
- Archivo Q8_0: https://huggingface.co/DICPlay/RusMind-3.2-Vspyshka/blob/main/RusMind-Vspyshka-3.2-Q8_0.gguf
