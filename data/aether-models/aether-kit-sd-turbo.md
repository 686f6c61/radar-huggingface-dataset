# aether-models/aether-kit-sd-turbo

## Resumen

Aether-kit-sd-turbo es una exportación del modelo de difusión texto-a-imagen stabilityai/sd-turbo (revisión `b261bac6`) realizada por el proyecto Aether-Kit mediante su exportador Forge (`Forge/sdturbo/`). El resultado se empaqueta como grafos de Core AI (encoder de texto CLIP, U-Net y decodificador VAE, en float32 y resolución 512×512) y se distribuye con un manifiesto `.aether/aether.json` pensado para cargarse con el componente `AetherImage` (`latent-diffusion@1`) del SDK Aether-Kit. No se trata de un modelo entrenado desde cero ni de un fine-tune con datos nuevos, sino de un artefacto de despliegue derivado del modelo base de Stability AI.

Su relevancia es acotada: interesa a quienes trabajan con el ecosistema Aether-Kit y quieren ejecutar generación texto-a-imagen rápida (sd-turbo está optimizado para pocas etapas de muestreo) dentro de ese runtime, con pesos en float32 y validación frente a Diffusers en CPU. El repositorio ocupa 5,0 GB y no registra descargas ni interacciones en Hugging Face en el momento de la consulta.

La información disponible no incluye detalles sobre el proceso de entrenamiento original, benchmarks ni idiomas soportados más allá de lo que aporta la model card del exportador. La licencia es la Stability AI Community License, que impone condiciones específicas para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente (U-Net + encoder de texto CLIP + decodificador VAE), exportada como grafos de Core AI |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin ventana de contexto de texto) |
| Tipos de cuantización | float32 (única precisión indicada en la exportación) |
| Idiomas soportados | no disponible |
| Licencia | Stability AI Community License (`stabilityai-ai-community`) |
| Formato de pesos | Grafos de Core AI con manifiesto `.aether/aether.json` (no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente es SD-Turbo de Stability AI, un modelo de difusión latente que combina un encoder de texto CLIP, una U-Net de denoising y un VAE para decodificar latentes a imagen. La exportación de Aether-Kit conserva esos tres componentes como grafos separados de Core AI, en float32 y a 512×512 píxeles, y añade un manifiesto que describe cómo ensamblarlos en el runtime `AetherImage` (`latent-diffusion@1`). El exportador valida el resultado comparándolo con Diffusers ejecutado en CPU, según el `export-report.json` citado en la model card.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias del modelo base (muestreo en pocas etapas) y del proceso de exportación a Core AI, que según el repositorio del SDK gestiona la memoria de Metal recargando el modelo cuando la memoria retenida supera un presupuesto (2 GiB por defecto).

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) a resolución 512×512.
- Ejecución dentro del runtime Core AI mediante el componente `AetherImage` y el manifiesto `.aether/aether.json`.
- Componentes separados y accesibles: encoder de texto CLIP, U-Net y decodificador VAE.
- Precisión float32 en la exportación, lo que facilita la reproducibilidad frente a Diffusers.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Prototipado rápido de generación de imágenes dentro del ecosistema Aether-Kit: el manifiesto y el componente `AetherImage` permiten cargar el modelo sin escribir un pipeline de difusión propio.
- Validación de pipelines de exportación: sirve como referencia para comprobar que el exportador Forge produce grafos Core AI equivalentes a Diffusers en CPU, gracias al `export-report.json`.
- Generación de ilustraciones y borradores visuales a 512×512 en aplicaciones locales o de escritorio que ya integren el SDK Aether-Kit.
- Pruebas de integración continua de aplicaciones basadas en Core AI: al estar empaquetado como grafos con manifiesto, se puede usar para verificar la carga, el consumo de memoria y la recarga cuando cambia la forma de entrada.
- Experimentación con los componentes por separado (CLIP, U-Net, VAE) para investigación sobre difusión latente o para sustituir módulos concretos en prototipos.
- Demostraciones y material docente sobre modelos texto-a-imagen: el formato de exportación explícito facilita explicar la estructura interna de un pipeline de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 5,0 GB y los pesos se distribuyen en float32, por lo que se requiere al menos espacio equivalente para los tres componentes en memoria.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el SDK menciona gestión de memoria de Metal, lo que sugiere soporte en hardware Apple, pero no se detallan modelos concretos.
- Opciones de despliegue: runtime Core AI de Aether-Kit mediante `AetherImage` (`latent-diffusion@1`); no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aether-kit-sd-turbo | no disponible | no aplica | no disponible | Stability AI Community License | Hugging Face (aether-models) |
| stabilityai/sd-turbo | no disponible | no aplica | no disponible en esta ficha | Stability AI Community License | Hugging Face (stabilityai) |
| Otras alternativas texto-a-imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el modelo base stabilityai/sd-turbo, del que este artefacto es una exportación a Core AI. No se dispone de datos para comparar con otros modelos de difusión.

## Limitaciones y advertencias

- Es una versión modificada y no un lanzamiento oficial de Stability AI; la model card remite al archivo `NOTICE`.
- El uso comercial requiere registro con Stability AI y está limitado a organizaciones con ingresos anuales inferiores a 1.000.000 USD; los productos deben mostrar "Powered by Stability AI".
- La exportación está fijada a float32 y 512×512; no se documentan otras precisiones ni resoluciones.
- No se documentan sesgos, tasas de alucinación visual ni limitaciones idiomáticas específicas.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de uso en producción.
- La validación se realizó frente a Diffusers en CPU; el comportamiento en otras configuraciones no está documentado.
- El SDK advierte de que Core AI retiene memoria de Metal cuando cambia la forma de entrada, con recarga del modelo al superar un presupuesto de 2 GiB por defecto, lo que puede afectar a la latencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aether-models/aether-kit-sd-turbo
- Modelo base: https://huggingface.co/stabilityai/sd-turbo
- Repositorio del SDK Aether-Kit: https://github.com/bubstackdev/aether-kit
- Perfil de la organización en Hugging Face: https://huggingface.co/aether-models
