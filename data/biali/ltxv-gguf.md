# biali/ltxv-gguf

## Resumen

El repositorio `biali/ltxv-gguf` contiene versiones cuantizadas en formato GGUF del modelo LTX-Video, desarrollado originalmente por Lightricks. LTX-Video es un modelo de difusión latente de aproximadamente 2 mil millones de parámetros especializado en generación de vídeo a partir de imágenes (image-to-video) y texto. Este repositorio, mantenido por el usuario biali (aunque la autoría original del conjunto GGUF corresponde a calcuis), ofrece diferentes cuantizaciones que permiten ejecutar el modelo en hardware de consumo con requisitos de VRAM reducidos, sin necesidad de un GPU de datacenter.

La relevancia de este modelo radica en que democratiza la generación de vídeo por IA: al estar cuantizado en GGUF, puede integrarse fácilmente en ComfyUI mediante el nodo `gguf-node` o usarse desde la consola con `gguf-connector`. El modelo base LTX-Video emplea un transformer de difusión latente con un VAE y un codificador de texto T5, y es capaz de generar clips de vídeo de alta calidad a partir de una imagen inicial y un prompt en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión latente (LTX-Video) |
| Parámetros totales | 1.923.385.472 (modelo base safetensors) |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generación de vídeo) |
| Tipos de cuantización | IQ4_NL, Q6_K, Q8_0, FP8 (según archivos disponibles) |
| Idiomas soportados | Inglés (prompts) |
| Licencia | Otro (no especificada; se debe verificar con Lightricks) |
| Formato de pesos | GGUF, safetensors (base) |

## Arquitectura y entrenamiento

LTX-Video es un modelo de difusión latente que utiliza un transformer 3D para procesar tokens espacio-temporales. El pipeline completo incluye un VAE que comprime los frames de vídeo en un espacio latente, un text encoder (T5-XXL) para condicionamiento por texto, y el transformer de difusión que genera los tokens latentes. El modelo base se entrenó con un gran conjunto de datos de vídeo y texto, aunque los detalles específicos del entrenamiento no están disponibles en la información proporcionada.

Las versiones GGUF de este repositorio son simplemente cuantizaciones del modelo original, por lo que no implican cambios en la arquitectura. La cuantización reduce la precisión de los pesos (por ejemplo, de FP16 a 4 bits o 8 bits) para disminuir el consumo de memoria y acelerar la inferencia en GPUs con menos VRAM. El repositorio también incluye variantes de VAE y del text encoder en formato GGUF para una integración completa.

## Capacidades

- Generación de vídeo a partir de una imagen inicial y un prompt de texto en inglés.
- Generación de vídeo a partir de texto (aunque el pipeline oficial es image-to-video, el modelo puede aceptar prompts de texto).
- Muestreo de vídeo con control de número de pasos (recomendado 15 pasos para la versión destilada).
- Compatibilidad con ComfyUI mediante el nodo `gguf-node` y con el ejecutable `gguf-connector`.
- Soporte de negativo prompt para mejorar la calidad y evitar artefactos.
- Capacidad de mezclar distintos archivos GGUF (por ejemplo, usar un VAE de otra versión) para optimizar resultados.

## Casos de uso

- **Generación de clips de vídeo para redes sociales**: crear vídeos cortos a partir de una imagen fija y una descripción textual, ideal para contenido de Instagram o TikTok.
- **Prototipado de escenas en producción audiovisual**: directores y editores pueden generar previsualizaciones de escenas antes de rodar, ahorrando tiempo y costes.
- **Creación de contenido publicitario**: generar vídeos de producto o ambientaciones a partir de imágenes de catálogo y textos creativos.
- **Educación y formación**: producir vídeos explicativos animados a partir de ilustraciones o diagramas.
- **Desarrollo de videojuegos**: generar animaciones de fondo o cinemáticas de baja resolución para prototipos.
- **Accesibilidad**: al estar cuantizado, puede ejecutarse en GPUs de consumo (8 GB de VRAM) y en portátiles con NVIDIA RTX, facilitando su uso en entornos sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas estándar (como FVD o CLIP score) para comparar este modelo cuantizado con el original o con otros modelos de generación de vídeo.

## Requisitos de hardware

- **VRAM estimada**: con la cuantización IQ4_ML (aproximadamente 4 GB para el modelo principal), se puede ejecutar en GPUs con 8 GB de VRAM, incluyendo el VAE y el text encoder. Para la versión Q8_0 (≈8 GB), se recomienda al menos 12 GB.
- **GPUs compatibles**: NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB), RTX 4090 (24 GB), así como GPUs de datacenter (A100, H100) para versiones sin cuantizar.
- **Despliegue**: ComfyUI con `gguf-node` es la opción más común; también se puede usar `gguf-connector` desde terminal.
- **Latencia**: para una secuencia de 97 frames con 15 pasos, en una RTX 4090 se estiman unos 30-60 segundos; en una RTX 3060 el tiempo puede duplicarse o triplicarse.
- **Almacenamiento**: el repositorio pesa 538 GB en total (todos los archivos), pero cada archivo GGUF individual es de unos 1-4 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-Video (base) | 2B | safetensors | FP16 | Apache 2.0 | HuggingFace |
| AnimateDiff | 1.7B | safetensors | FP16 | Apache 2.0 | HuggingFace |
| ModelScope T2V | 1.7B | safetensors | FP16 | Apache 2.0 | HuggingFace |
| LTX-Video (GGUF) | 2B (cuantizado) | GGUF | IQ4, Q6, Q8 | Otro | Repo actual |

La principal ventaja de esta versión GGUF es su menor huella de memoria y compatibilidad con herramientas de cuantización. Sin embargo, no se dispone de comparaciones de rendimiento objetivo con los otros modelos.

## Limitaciones y advertencias

- **Licencia**: el repositorio indica licencia "other"; el modelo base de Lightricks tiene licencia Apache 2.0, pero se recomienda revisar los términos específicos de la versión GGUF.
- **Calidad de cuantización**: las versiones de menor precisión (como IQ4) pueden introducir artefactos visuales o degradar la coherencia temporal. La versión Q8_0 ofrece mejor calidad pero requiere más VRAM.
- **Idioma**: el modelo solo soporta prompts en inglés; no se ha entrenado con otros idiomas.
- **Riesgo de alucinación visual**: al ser un modelo generativo, puede producir objetos o movimientos irreales que no coinciden con el prompt.
- **Uso comercial**: la licencia "other" podría restringir el uso comercial; se debe consultar la documentación de Lightricks.
- **Memoria**: aunque la cuantización reduce el peso del modelo, el VAE y el text encoder también consumen VRAM; para un funcionamiento fluido se recomienda al menos 12 GB de VRAM.

## Enlaces

- Repositorio HuggingFace: [biali/ltxv-gguf](https://huggingface.co/biali/ltxv-gguf)
- Repositorio original de calcuis: [calcuis/ltxv-gguf](https://huggingface.co/calcuis/ltxv-gguf)
- Documentación de gguf-node: [https://github.com/calcuis/gguf](https://github.com/calcuis/gguf)
- Modelo base Lightricks/LTX-Video: [https://huggingface.co/Lightricks/LTX-Video](https://huggingface.co/Lightricks/LTX-Video)
