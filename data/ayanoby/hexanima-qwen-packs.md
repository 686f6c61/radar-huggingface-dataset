# ayanoby/hexanima-qwen-packs

## Resumen

HexAnima Qwen-Packs es un conjunto de pesos convertidos y empaquetados para ejecutar generación de texto a imagen y edición de fotografías en la NPU Hexagon de los SoC Qualcomm Snapdragon 8 Gen 1 y 8+ Gen 1, es decir, en teléfonos Android. Lo desarrolla el autor independiente ayanoby dentro del proyecto HexAnima, y no es un modelo entrenado desde cero: es una redistribución optimizada de Qwen-Image-2.1-Turbo (en cuantización Unsloth Q5_K_S GGUF) combinada con el adaptador de destilación de 4 pasos Lightning v2-RL de lightx2v, el codificador de texto y torre de visión de Qwen3-VL-8B-Instruct y el VAE de Qwen-Image-2.1.

Su relevancia es de nicho pero muy concreta: permite llevar un pipeline de difusión de clase producción a hardware móvil con aceleración NPU, algo que habitualmente requiere GPU de escritorio. El repositorio ocupa unos 14,9 GB y se distribuye en ficheros que la aplicación oficial descarga de uno en uno con reanudación y verificación sha256 mediante `manifest.json`.

La licencia es restrictiva: el transformer, el adaptador Lightning y el VAE quedan bajo Qwen Research License (solo uso no comercial), mientras que el codificador de texto es Apache-2.0. El proyecto es independiente y no está afiliado a los autores citados en `NOTICE.md`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion: DiT (Qwen-Image-2.1-Turbo) + codificador de texto y torre de vision (Qwen3-VL-8B-Instruct) + VAE (Qwen-Image-2.1), empaquetado para NPU Hexagon |
| Parametros totales | no disponible (el repo pesa 14,9 GB; desglose por componente: text encoder 6,2 GB, DiT 6,4 GB, vision tower 0,9 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_S GGUF en el transformer (Unsloth); en el pack v2, tiles 4-bit sin perdida para tensores Q4_K y 8-bit para el resto |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License (uso no comercial) para transformer, adaptador Lightning y VAE; Apache-2.0 para el text encoder |
| Formato de pesos | Ficheros propietarios del proyecto HexAnima con `manifest.json` y verificacion sha256; **no utilizables con otras herramientas** |

## Arquitectura y entrenamiento

El paquete no entrena un modelo nuevo: compone un pipeline de difusión latente estándar con un transformer de difusión (DiT) como generador, un codificador de texto multimodal de la familia Qwen3-VL-8B que también aporta torre de visión para edición de imagen, y un VAE que mueve entre espacio de píxeles y latentes. Sobre el DiT se aplica el adaptador Lightning v2-RL de 4 pasos, una destilación que reduce el número de pasos de muestreo necesarios, lo que resulta crítico en un móvil donde cada paso cuesta energía y latencia.

La innovación técnica del repositorio no está en el entrenamiento sino en la conversión: los pesos se reorganizan en tiles cuantizados (4-bit sin pérdida para los tensores Q4_K, 8-bit para el resto en el pack v2) y se adaptan al formato que consume la NPU Hexagon vía la app HexAnima. No hay información publicada sobre tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la documentación disponible, más allá de que el adaptador Lightning proviene de una destilación con RL.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con el pipeline Qwen-Image-2.1-Turbo.
- Edición de fotografías (image editing) apoyada en el codificador de texto y la torre de visión de Qwen3-VL-8B.
- Muestreo en 4 pasos gracias al adaptador Lightning v2-RL, orientado a latencia baja en dispositivo.
- Comprensión de instrucciones multimodales para edición, al integrar un codificador de visión.
- Ejecución en NPU Hexagon de Snapdragon 8 Gen 1 / 8+ Gen 1 mediante la app oficial.
- Descarga por partes con reanudación y verificación sha256 integrada en la app.
- No se documentan capacidades de tool calling, agentes, audio ni modo thinking en este paquete.

## Casos de uso

- Generación de imágenes en el propio teléfono sin conexión: la app descarga los packs una vez y ejecuta el pipeline en la NPU, útil para crear ilustraciones o avatares sin enviar datos a la nube.
- Edición fotográfica privada: retoques guiados por instrucciones en lenguaje natural sobre fotos personales, con el procesamiento íntegro en el dispositivo y sin subida a servidores.
- Prototipado de apps Android con IA generativa: desarrolladores que quieran validar experiencias de generación de imagen en hardware Snapdragon 8 Gen 1 antes de invertir en infraestructura cloud.
- Demos y ferias sin conectividad fiable: el pipeline funciona localmente, lo que evita depender del ancho de banda del recinto.
- Investigación sobre inferencia de difusión en NPU móvil: el empaquetado en tiles cuantizados y el adaptador de 4 pasos sirven como banco de pruebas para estudiar latencia y consumo en Hexagon.
- Filtrado o previsualización rápida de conceptos visuales: generar borradores de baja fidelidad en el móvil antes de lanzar una generación de mayor calidad en una GPU.
- Educación y experimentación con licencia de investigación: entornos académicos que quieran estudiar pipelines de difusión cuantizados en dispositivos de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: unos 14,9 GB para el conjunto completo de packs (text encoder 6,2 GB, DiT 6,4 GB, vision tower 0,9 GB, más embeddings, glue y contextos del VAE).
- Hardware objetivo: NPU Hexagon de Qualcomm Snapdragon 8 Gen 1 y 8+ Gen 1. No se documenta soporte para otras NPU ni para GPU de escritorio.
- VRAM estimada: no disponible; el modelo está pensado para memoria unificada de móvil, no para VRAM de GPU.
- GPU recomendadas: no aplica; los pesos no son utilizables con otras herramientas según el autor.
- Despliegue: exclusivamente mediante la app HexAnima (https://github.com/ayanoby/hexanima), que gestiona descarga, reanudación y verificación sha256. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HexAnima Qwen-Packs | Pipeline de difusion empaquetado para NPU Hexagon | no disponible (14,9 GB en total) | no disponible | Qwen Research License (no comercial) | Solo app HexAnima |
| Qwen-Image-2.1-Turbo | Modelo base de difusion | no disponible | no disponible | Qwen Research License | Hugging Face, ecosistema de difusion |
| Qwen3-VL-8B-Instruct | Modelo multimodal de lenguaje y vision | 8B (aproximado por el nombre) | no disponible | Apache-2.0 | Hugging Face, amplio soporte de herramientas |
| lightx2v Qwen-Image-Lightning | Adaptador de destilacion de pasos | no disponible | no aplica | no disponible | Hugging Face |

La comparación relevante no es de calidad sino de formato: frente al modelo base y al adaptador originales, este paquete pierde portabilidad (no funciona fuera de la app HexAnima) y gana ejecución en NPU móvil con cuantización agresiva. Frente a Qwen3-VL-8B-Instruct, que es un modelo de lenguaje y visión con licencia permisiva y soporte amplio de herramientas, aquí solo se reutilizan su codificador de texto y su torre de visión como componentes del pipeline de difusión.

## Limitaciones y advertencias

- Licencia no comercial: el transformer, el adaptador Lightning y el VAE están bajo Qwen Research License, lo que impide uso comercial sin acuerdo adicional. El text encoder es Apache-2.0, pero eso no levanta la restricción del resto del pipeline.
- Portabilidad nula: el autor indica explícitamente que los ficheros no son utilizables con otras herramientas; quedan atados a la app HexAnima y a la NPU Hexagon.
- Cobertura de hardware muy estrecha: solo Snapdragon 8 Gen 1 y 8+ Gen 1; no hay información sobre otros SoC Qualcomm ni sobre versiones posteriores.
- Riesgo de alucinación visual y artefactos: al ser un pipeline de difusión cuantizado a 4-8 bits y destilado a 4 pasos, cabe esperar menor fidelidad que el modelo completo con más pasos de muestreo.
- Idiomas no documentados: no se especifica qué lenguas entiende el codificador de texto en este empaquetado, por lo que la calidad multilingüe es incierta.
- Sesgos: no se documentan evaluaciones de sesgo; al heredar los datos de Qwen-Image-2.1 y Qwen3-VL, arrastra los sesgos de sus corpus originales.
- Madurez del proyecto: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; es un proyecto independiente y no oficial, sin afiliación con los autores citados.
- Sin benchmarks publicados: no hay métricas de calidad, latencia ni consumo que permitan evaluar el rendimiento real frente a alternativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ayanoby/hexanima-qwen-packs
- Aplicación HexAnima: https://github.com/ayanoby/hexanima
- Modelo base Qwen-Image-2.1-Turbo: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Adaptador Lightning: https://huggingface.co/lightx2v/Qwen-Image-Lightning
- Codificador de texto y vision Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
