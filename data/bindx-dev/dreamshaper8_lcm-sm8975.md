# bindx-dev/dreamshaper8_lcm-sm8975

## Resumen

DreamShaper 8 LCM para Snapdragon 8 Elite Extreme Gen 6 (SM8975) es una conversión del modelo de difusión DreamShaper 8 de Lykon, fusionado con el LoRA de consistencia latente LCM-LoRA SD v1.5 y compilado por bindx-dev como binarios de contexto QNN para la NPU Hexagon HTP v85. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales de Stable Diffusion 1.5 (DreamShaper 8) se han cuantizado a W8A16 y empaquetado en ficheros `.bin` ejecutables directamente sobre el acelerador neural de Qualcomm mediante QAIRT 2.52.1.261105.

La relevancia del artefacto es de ingeniería de despliegue: permite ejecutar generación de imágenes con difusión en un dispositivo móvil con Snapdragon 8 Elite sin necesidad de conversión en el dispositivo, con un tiempo de inferencia medido de 7,58 s en caliente para 4 pasos con CFG 1,5 y un pico de RSS de 1.327 MB. El repositorio pesa 1,1 GB y contiene tres binarios independientes: `text_encoder.bin`, `unet.bin` y `vae.bin`.

El modelo hereda la licencia CreativeML OpenRAIL-M del modelo base y todas sus restricciones de uso. No hay información publicada sobre idiomas soportados ni pipeline en Hugging Face, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + text encoder CLIP + VAE) con fusión de LCM-LoRA; compilado a QNN context binaries para Hexagon HTP v85 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión texto-a-imagen; longitud de prompt no especificada) |
| Tipos de cuantizacion | W8A16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible (el prompt textual depende del text encoder CLIP de SD 1.5, predominantemente inglés) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | QNN context binaries (`.bin`): `text_encoder.bin`, `unet.bin`, `vae.bin` |
| Modelo base | Lykon/dreamshaper-8 |
| LoRA fusionado | latent-consistency/lcm-lora-sdv1-5 |
| Plataforma objetivo | Qualcomm SM8975 (Snapdragon 8 Elite Extreme Gen 6, Hexagon HTP v85) |
| Toolchain | BindX QAIRT 2.52.1.261105 (AOT) |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

El modelo subyacente es DreamShaper 8, un fine-tune de Stable Diffusion 1.5 orientado a calidad estética y versatilidad de estilos. Sobre él se ha fusionado LCM-LoRA SD v1.5, que convierte el muestreo de difusión estándar (decenas de pasos) en un muestreo de consistencia latente que permite generar imágenes coherentes en 4 pasos con CFG 1,5. La arquitectura resultante mantiene los tres componentes clásicos: text encoder CLIP, UNet de difusión y VAE decodificador.

La innovación del artefacto no está en el entrenamiento sino en la compilación: bindx-dev ha convertido los pesos fusionados a binarios de contexto QNN mediante QAIRT en modo Ahead-Of-Time, cuantizando a W8A16 y dirigiéndolos a la NPU Hexagon HTP v85 del SM8975. Esto elimina la necesidad de conversión en el dispositivo y permite cargar los grafos compilados directamente en la NPU. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de imágenes texto-a-imagen con 4 pasos de muestreo y CFG 1,5 gracias a la fusión de LCM-LoRA.
- Estilos variados heredados de DreamShaper 8 (fotorrealismo, ilustración, anime, conceptual).
- Ejecución acelerada en NPU Hexagon HTP v85 de dispositivos SM8975 mediante binarios QNN precompilados.
- Inferencia de extremo a extremo con un pico de memoria de 1.327 MB según la medición del autor.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.
- El soporte multilingüe del prompt depende del text encoder CLIP de SD 1.5, no documentado en esta ficha.

## Casos de uso

- Generación de imágenes en dispositivos móviles con Snapdragon 8 Elite: el modelo se carga como binarios QNN en la NPU y produce una imagen en 4 pasos en aproximadamente 7,58 s en caliente, adecuado para aplicaciones de cámara o edición que requieran generación local sin nube.
- Prototipado de apps de IA generativa on-device: al estar precompilado para HTP v85, evita al equipo la conversión QAIRT y permite validar experiencias de usuario con latencia realista de 7,70 s end-to-end.
- Filtros y estilización de imágenes en tiempo cuasi-real: la ventana de 4 pasos con CFG 1,5 permite iterar variaciones rápidas sobre un mismo prompt o semilla en aplicaciones de diseño.
- Demos y pruebas de concepto de difusión en NPU: útil para comparar el rendimiento de Hexagon frente a GPU Adreno o CPU en el mismo dispositivo con un artefacto reproducible.
- Generación de assets para juegos móviles o contenidos sociales: la licencia OpenRAIL-M permite uso comercial con las restricciones de la licencia, y el peso de 1,1 GB facilita el empaquetado junto a la app.
- Investigación en cuantización W8A16 para difusión: el artefacto sirve como referencia de calidad visual tras cuantización de pesos a 8 bits en un UNet de SD 1.5.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Pasos de muestreo | 4 |
| CFG | 1,5 |
| Latencia NPU en caliente | 7,58 s |
| Latencia end-to-end | 7,70 s |
| Pico de RSS | 1.327 MB |
| Fecha de medición | 2026-11-25 |
| Dispositivo | QDC con SM8975 (Snapdragon 8 Elite Extreme Gen 6) |

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- Plataforma obligatoria: Qualcomm SM8975 (Snapdragon 8 Elite Extreme Gen 6) con Hexagon HTP v85; los binarios QNN no son portables a otras NPU.
- Memoria: pico de RSS medido de 1.327 MB durante la inferencia; se recomienda margen adicional para la app anfitriona.
- Almacenamiento: 1,1 GB para los tres binarios de contexto.
- Toolchain: QAIRT 2.52.1.261105 para cargar y ejecutar los context binaries.
- No es desplegable en GPU de escritorio, vLLM, llama.cpp, Ollama ni TGI: el formato `.bin` QNN es específico de la NPU Hexagon.
- Latencia y throughput: 7,58 s por imagen en caliente con 4 pasos y CFG 1,5; no se documenta throughput en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Plataforma | Pasos | Licencia |
|---|---|---|---|---|---|
| bindx-dev/dreamshaper8_lcm-sm8975 | no disponible | QNN `.bin` | SM8975 HTP v85 | 4 | CreativeML OpenRAIL-M |
| Lykon/dreamshaper-8 | no disponible | safetensors | GPU/CPU genérica | 20-30 típicos | CreativeML OpenRAIL-M |
| latent-consistency/lcm-lora-sdv1-5 | no disponible | safetensors (LoRA) | GPU/CPU genérica | 4-8 | no disponible en la información |
| Stable Diffusion 1.5 (runwayml) | no disponible | safetensors | GPU/CPU genérica | 20-50 típicos | CreativeML OpenRAIL-M |

La comparativa relevante es de despliegue: frente a los pesos originales en safetensors, este artefacto sacrifica portabilidad a cambio de ejecución nativa en NPU móvil con cuantización W8A16. No se dispone de datos de calidad comparada entre la versión cuantizada y el modelo original.

## Limitaciones y advertencias

- Dependencia total de hardware: los binarios solo funcionan en SM8975 con HTP v85 y QAIRT 2.52.1.261105; cualquier otro chip o versión de toolchain requiere reconversión.
- La cuantización W8A16 puede introducir degradación visual respecto a los pesos originales en fp16; no se documenta una evaluación de calidad.
- Riesgo de sesgos heredados de Stable Diffusion 1.5 y DreamShaper 8, incluyendo sesgos demográficos y estilísticos del dataset original.
- Riesgo de alucinación visual: el modelo puede generar anatomía incorrecta, texto ilegible y artefactos propios de la difusión con pocos pasos.
- Licencia CreativeML OpenRAIL-M: permite uso comercial pero impone restricciones de uso (prohibición de usos dañinos, obligación de incluir las restricciones en redistribuciones); revisar el texto completo antes de producción.
- Sin datos publicados de idiomas soportados; el text encoder CLIP de SD 1.5 rinde peor en prompts no ingleses.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validación comunitaria independiente del artefacto.
- El autor no documenta el pipeline en Hugging Face ni instrucciones de integración más allá de la referencia a QAIRT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bindx-dev/dreamshaper8_lcm-sm8975
- Modelo base DreamShaper 8: https://huggingface.co/Lykon/dreamshaper-8
- LCM-LoRA SD v1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- Stable Diffusion 1.5: https://huggingface.co/runwayml/stable-diffusion-v1-5
- Qualcomm QAIRT (Qualcomm AI Runtime): no disponible en la información proporcionada
- Paper de LCM-LoRA: no disponible en la información proporcionada
