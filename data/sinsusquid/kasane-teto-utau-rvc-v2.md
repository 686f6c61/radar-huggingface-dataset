# SinsuSquid/Kasane-Teto-UTAU-RVC-v2

## Resumen

Kasane Teto UTAU RVC v2 es un modelo de conversión de voz (voice conversion) basado en la arquitectura Retrieval-based Voice Conversion v2 (RVC v2), desarrollado por el usuario SinsuSquid. No es un modelo de lenguaje: convierte una señal de voz de entrada en la voz sintética del personaje virtual Kasane Teto (重音テト), preservando el contenido fonético y la entonación del audio original. Está entrenado a partir del voicebank UTAU oficial de 2024, en formato anecoico y sin compresión, publicado por Twindrill en kasaneteto.jp.

El modelo se distribuye como pesos de un generador HiFi-GAN a 40 kHz (`KasaneTeto.pth`, 53 MB) junto con un índice FAISS de recuperación de características (`KasaneTeto.index`, 129 MB), más un paquete listo para usar en Applio o RVC WebUI. El entrenamiento se realizó sobre una GPU NVIDIA A100-SXM4-40GB durante 200 épocas y 3.600 actualizaciones de gradiente, con una pérdida final del generador Mel-espectral de 36,014.

Su relevancia radica en la limpieza del dataset de origen: la mayoría de modelos RVC de Teto disponibles arrastran música de fondo, reverberación de sala y errores de seguimiento de tono procedentes de extracciones automáticas con UVR5. Este modelo parte de 400 grabaciones de cabina anecoicas y emplea RMVPE para la extracción de f0 y ContentVec para el agrupamiento tímbrico, lo que reduce artefactos en la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion) con generador HiFi-GAN a 40 kHz y extractor de características ContentVec, índice FAISS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de conversión de voz, no de texto) |
| Tipos de cuantizacion | no disponible (pesos `.pth` de PyTorch en precisión de entrenamiento) |
| Idiomas soportados | japones (ja), coreano (ko), ingles (en) |
| Licencia | other (uso no comercial para creaciones de fan con atribución, segun las directrices de Twindrill) |
| Formato de pesos | `.pth` (PyTorch), `.index` (FAISS); paquete `.zip` para Applio/RVC WebUI |

## Arquitectura y entrenamiento

El modelo sigue el esquema estándar de RVC v2: un extractor de características (ContentVec) obtiene representaciones fonéticas del audio de entrada, un índice FAISS realiza recuperación de características para preservar el timbre objetivo, y un generador HiFi-GAN a 40 kHz sintetiza la forma de onda final. La estimación de tono (f0) se realiza con RMVPE, elegido por su robustez frente a los errores de octava que afectan a métodos como `harvest` o `pm`.

El dataset de entrenamiento procede del voicebank UTAU oficial de 2024 (`TETO-OUset240323.zip`), compuesto por 400 grabaciones de cabina anecoicas y sin compresión, sin música de fondo ni reverberación. El entrenamiento se ejecutó en una NVIDIA A100-SXM4-40GB durante 200 épocas y 3.600 actualizaciones de gradiente, alcanzando una pérdida Mel-espectral del generador de 36,014. El pipeline completo de preparación y entrenamiento está publicado en el repositorio de GitHub del autor.

## Capacidades

- Conversión de voz (voice-to-voice) preservando el contenido fonético y la prosodia del audio de entrada.
- Síntesis de la voz del personaje Kasane Teto a 40 kHz con timbre UTAU distintivo.
- Extracción de tono robusta mediante RMVPE, con menor incidencia de saltos de octava.
- Recuperación de características por similitud (índice FAISS de 129 MB) para reforzar el timbre objetivo.
- Soporte de audio en japonés, coreano e inglés (según los idiomas declarados en la model card).
- Ajuste de timbre mediante el parámetro `index rate` (0,75 recomendado) y de consonantes mediante `protect consonants` (0,33 recomendado).
- Desplazamiento de tono (`pitch shift`) configurable, por ejemplo +12 semitonos para convertir voces masculinas al registro femenino.
- Integración con Applio y RVC WebUI mediante descarga directa del paquete o colocación manual de pesos e índice.

## Casos de uso

- Producción de covers musicales de fan: el modelo convierte una pista vocal en la voz de Teto manteniendo la melodía y la letra, con `pitch shift` ajustable para adaptar el registro.
- Doblaje amateur de contenido audiovisual: se puede aplicar la voz de Teto sobre locuciones existentes en japonés, coreano o inglés para proyectos de fansub o vídeos de YouTube.
- Creación de contenido para VTubers y comunidades UTAU/Vocaloid: generación de voces para canciones originales o parodias con atribución a Twindrill.
- Prototipado rápido de voces sintéticas: investigadores pueden usar el par `.pth` + `.index` como referencia de un pipeline RVC v2 limpio, entrenado sobre datos anecoicos.
- Evaluación de técnicas de conversión de voz: el modelo sirve como baseline para comparar métodos de extracción de f0 (RMVPE frente a harvest/pm) o de recuperación de características.
- Docencia y demostraciones de RVC: el paquete de un clic para Applio/RVC WebUI facilita talleres prácticos sin necesidad de entrenar desde cero.
- Experimentación con desplazamiento de tono y control de timbre: los parámetros `index rate` y `protect consonants` permiten estudiar el equilibrio entre fidelidad al timbre y naturalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas de entrenamiento: 200 épocas, 3.600 actualizaciones de gradiente y una pérdida Mel-espectral del generador de 36,014.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de los pesos (53 MB del generador y 129 MB del índice FAISS), la inferencia es ligera y cabe holgadamente en GPU de consumo.
- GPU recomendadas: el entrenamiento se realizó en NVIDIA A100-SXM4-40GB; para inferencia basta con GPU consumer (por ejemplo, RTX 3060, RTX 4060 o superiores). No se especifican modelos concretos en la documentación.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM, aunque el dato no está confirmado en la model card.
- Opciones de despliegue: Applio, RVC WebUI (descarga directa del `.zip` o colocación manual de `KasaneTeto.pth` y `KasaneTeto.index`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencia de muestreo | Extracción de f0 | Índice FAISS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kasane Teto UTAU RVC v2 (SinsuSquid) | RVC v2 | 40 kHz | RMVPE | Sí (129 MB) | other (no comercial con atribución) | Hugging Face |
| Otros modelos RVC de Kasane Teto en la comunidad | RVC v1/v2 | variable | harvest / pm habitualmente | variable | variable | repositorios comunitarios |
| Modelos RVC genéricos de conversión de voz | RVC v2 | 32-48 kHz | RMVPE / harvest | opcional | variable | múltiples repositorios |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada. La principal diferencia declarada por el autor frente a otros modelos RVC de Teto es el uso de grabaciones anecoicas sin BGM ni reverberación y la extracción de tono con RMVPE.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Riesgo de artefactos en la conversión cuando el audio de entrada contiene ruido, música o reverberación, pese a la limpieza del dataset de entrenamiento.
- El timbre puede desviarse si se usan valores de `index rate` muy altos o muy bajos; el autor recomienda 0,75.
- Los saltos de octava pueden aparecer en voces con registros extremos, aunque RMVPE reduce su frecuencia.
- Licencia restrictiva: uso libre solo para creaciones de fan no comerciales con atribución, sujeto a las directrices de Twindrill (kasaneteto.jp/guideline/voice.html). El uso comercial requiere autorización expresa.
- Los derechos del personaje y de la voz pertenecen a Twindrill y a la proveedora de voz Oyamano Mayo; el modelo no transfiere esos derechos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del rendimiento en producción.
- Idiomas declarados (ja, ko, en) pero sin evaluación publicada de calidad por idioma.
- No se especifican parámetros totales del modelo ni requisitos oficiales de VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SinsuSquid/Kasane-Teto-UTAU-RVC-v2
- Repositorio de pipeline y entrenamiento: https://github.com/SinsuSquid/KasaneTeto_RVC
- Portal oficial de Twindrill: https://kasaneteto.jp/
- Directrices de licencia de voz de Twindrill: https://kasaneteto.jp/guideline/voice.html
