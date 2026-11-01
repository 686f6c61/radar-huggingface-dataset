# Hansda/ScreenVLM-GGUF

## Resumen

ScreenVLM-GGUF es una conversión al formato GGUF del checkpoint ScreenParse-v2 del modelo ScreenVLM, desarrollado originalmente por el proyecto Docling (docling-project). Se trata de un modelo de visión-lenguaje especializado en el análisis y la comprensión de interfaces de usuario: recibe una captura de pantalla y genera una representación estructurada de los elementos que la componen, incluyendo cajas delimitadoras en el espacio de coordenadas ScreenTag. La conversión la firma el usuario Hansda y su propósito es hacer el modelo ejecutable en llama.cpp, algo que el checkpoint original no permite de forma directa.

El modelo es deliberadamente pequeño: 221.808.960 parámetros totales (unos 222 millones) y un repositorio de 0,9 GB. Esta escala lo sitúa en la categoría de modelos ligeros que pueden ejecutarse en CPU o en GPUs de consumo, lo que resulta relevante para pipelines de automatización de UI, testing de aplicaciones y extracción de información de pantallas sin depender de infraestructura de servidor. La arquitectura subyacente es de tipo Idefics3, con un codificador visual y un proyector que se distribuyen en un archivo mmproj separado, más un decodificador cuantizado.

La relevancia actual del modelo reside en su nicho: el screen parsing o UI understanding es una tarea con demanda creciente en agentes que operan sobre interfaces gráficas, RPA moderno y accesibilidad. Al ofrecer una versión GGUF con cuantizaciones F16 y Q8_0 y un flujo de uso documentado para llama-server, el autor facilita el despliegue local de una tarea que habitualmente requiere modelos multimodales mucho mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Idefics3 (codificador visual + proyector + decodificador transformer) |
| Parametros totales | 221.808.960 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de llama-server; el maximo nativo no esta documentado) |
| Tipos de cuantizacion | F16 y Q8_0 (decodificador); vision encoder/proyector en F16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base ScreenVLM sigue la arquitectura Idefics3, un diseño de visión-lenguaje que combina un codificador visual con un proyector que mapea las características de imagen al espacio del decodificador de texto. La model card de la conversión detalla el preprocesado nativo: borde más largo de 2048 píxeles, mosaicos (tiles) de 512 píxeles más una vista general (overview), pixel shuffle 4×, remuestreo Lanczos y normalización con media y desviación típica de 0,5. Este esquema de tiles permite manejar capturas de pantalla de alta resolución sin perder detalle en elementos pequeños de la UI.

La conversión GGUF separa el modelo en tres archivos: el decodificador en Q8_0 (239.333.536 bytes) o F16 (447.246.496 bytes) y un proyector visual mmproj en F16 (190.031.392 bytes). El Q8_0 se deriva de la conversión F16 hecha a partir de los pesos originales. El conversor elimina dos token IDs que quedan fuera de las tablas de pesos de origen, aunque conserva todos los token IDs representables por el modelo y los pesos fuente; el detalle está documentado en `tokenizer-repair.json` y `CHANGES.md`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Análisis de capturas de pantalla (screen parsing): genera una representación estructurada de la UI a partir de una imagen.
- Detección de elementos de interfaz con cajas delimitadoras en el espacio de coordenadas ScreenTag, con coordenadas enteras en el rango [0,500].
- Comprensión de disposición y jerarquía visual de elementos en pantallas de aplicaciones.
- Conversación multimodal de tipo image-text-to-text (pipeline declarado en HuggingFace).
- Retención del prefijo de control `<loc_` mediante el flag `--special` de llama.cpp, necesario para interpretar las coordenadas.
- Integración con llama.cpp mediante `llama-server` y plantilla de chat embebida en formato Jinja.
- No se documentan capacidades de tool calling, agentes multi-paso, audio ni modo de razonamiento explícito.

## Casos de uso

- Automatización de pruebas de interfaz: dado un screenshot de la aplicación bajo test, el modelo extrae la representación de los elementos y permite verificar que los componentes esperados están presentes y en la posición correcta, sin necesidad de selectores frágiles basados en el DOM.
- RPA sobre aplicaciones de escritorio: en entornos donde no hay acceso a la API de accesibilidad del sistema, el modelo puede localizar botones, campos y menús a partir de la captura y alimentar un agente que ejecute clics en las coordenadas detectadas.
- Extracción de datos de pantallas legacy: para aplicaciones antiguas o terminales sin API, el modelo permite convertir una captura en una estructura de campos y valores reutilizable en un pipeline de datos.
- Asistencia a la accesibilidad: generación de descripciones estructuradas de la pantalla que pueden alimentar lectores de pantalla o herramientas de navegación asistida.
- Indexación y búsqueda de documentación visual: procesar capturas de tutoriales o manuales para construir un índice de elementos de UI y permitir búsquedas del tipo "dónde está el botón de exportar".
- Despliegue en local o en el borde: con 222 millones de parámetros y cuantización Q8_0, el modelo cabe en CPU y en GPUs de consumo, lo que permite ejecutar el análisis de pantalla en el propio dispositivo sin enviar capturas a un servicio externo, algo relevante por privacidad.
- Generación de datasets sintéticos de UI: usar las representaciones generadas para etiquetar automáticamente capturas y entrenar modelos de detección de elementos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el decodificador en F16 ocupa unos 447 MB y el mmproj unos 190 MB, por lo que la inferencia completa en F16 ronda los 640 MB de pesos; en Q8_0 el decodificador baja a unos 239 MB, con un total aproximado de 430 MB más overhead de contexto y activaciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100; el modelo no aprovecha la capacidad de GPUs de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPUs con suficiente memoria compartida.
- CPU: la model card indica explícitamente el modo CPU con `-ngl 0 --no-mmproj-offload`, por lo que es viable en equipos sin GPU dedicada.
- Despliegue: llama.cpp mediante `llama-server` en el commit `0ec4027`; no se documentan otras opciones como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScreenVLM-GGUF (esta ficha) | 221,8 M | 4096 (uso documentado) | Screen parsing / UI understanding | Apache-2.0 | GGUF en HuggingFace |
| docling-project/ScreenVLM (base) | 221,8 M | No disponible | Screen parsing / UI understanding | Apache-2.0 | Safetensors en HuggingFace |
| Modelos VLM generalistas de mayor tamano (p. ej. familia Qwen-VL o LLaVA) | Cientos de millones a decenas de miles de millones | Variable | Vision-lenguaje general | Variable | Multiples formatos |

La comparación con modelos VLM generalistas es cualitativa: no se dispone de datos de benchmarks del modelo ni de alternativas especializadas en screen parsing en la información proporcionada, por lo que no es posible establecer una comparación numérica rigurosa.

## Limitaciones y advertencias

- Modelo de nicho: está especializado en análisis de pantallas y no es un asistente general; su uso fuera de esa tarea probablemente dará resultados pobres.
- Idiomas: no se documenta qué idiomas soporta el decodificador, lo que impide garantizar calidad en textos de UI en castellano u otros idiomas.
- Dependencia de versión: la model card fija llama.cpp en el commit `0ec4027`; otras versiones pueden no reproducir el comportamiento esperado.
- Preprocesado estricto: es necesario preservar el pipeline Idefics3 nativo (tiles de 512, overview, pixel shuffle 4×, Lanczos, normalización 0,5); desviarse de él degrada la calidad de las cajas delimitadoras.
- Coordenadas normalizadas: las bounding boxes usan enteros en [0,500] y el prefijo `<loc_` debe conservarse con `--special`, lo que añade complejidad de integración.
- Reparación de tokenizer: el conversor elimina dos token IDs fuera de las tablas de pesos; conviene revisar `tokenizer-repair.json` antes de integrar en producción.
- Riesgo de alucinación: no hay datos publicados sobre tasas de error ni evaluación formal del modelo en la información disponible.
- Sesgos: no se documentan sesgos conocidos, pero al no haber información sobre el dataset de entrenamiento no puede descartarse su presencia.
- Licencia Apache-2.0: permite uso comercial, pero deben conservarse los términos y la atribución incluidos en `LICENSE` y `ATTRIBUTION.md`.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Hansda/ScreenVLM-GGUF
- Modelo base: https://huggingface.co/docling-project/ScreenVLM
- Checkpoint ScreenParse-v2: https://huggingface.co/docling-project/ScreenVLM/tree/78df0cc8498bbea1a03eb2816056fc0a76d2f63d
- llama.cpp (commit fijado): https://github.com/ggml-org/llama.cpp/tree/0ec4027a2a0183de87c007069adddc06e665f7de
