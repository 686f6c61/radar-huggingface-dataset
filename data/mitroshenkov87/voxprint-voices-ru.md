# Mitroshenkov87/voxprint-voices-ru

## Resumen

Voxprint voices ru es una colección de seis adaptadores LoRA para síntesis de voz (text-to-speech) en ruso, publicados por el usuario Mitroshenkov87 sobre el modelo base Qwen/Qwen3-TTS-12Hz-1.7B-Base. No es un modelo de lenguaje ni un modelo completo entrenado desde cero: es un conjunto de voces concretas empaquetadas para la aplicación Voxprint, una herramienta de construcción de audiolibros, de modo que cada adaptador añade una voz rusa fija al modelo base de 1.700 millones de parámetros.

Cada una de las seis voces (`levi`, `natan`, `shimon`, `miriam`, `rivka` y `noa`) se entrenó únicamente a partir de una lectura en solitario de dominio público procedente de LibriVox, lo que resuelve un problema habitual en clonación de voz: la falta de voces con procedencia legal clara. Al liberarse bajo CC0-1.0, los adaptadores pueden usarse sin restricciones, incluido uso comercial, algo poco frecuente en el ecosistema de TTS con clonación de voz.

El interés actual del repositorio es más práctico que investigador: aporta voces rusas listas para usar en un pipeline de audiolibros, con paquetes descargables e integración directa en la aplicación. El repositorio es pequeño (0,7 GB), no tiene descargas ni valoraciones registradas y no incluye resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre el modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-Base |
| Parametros totales | 1.700 millones en el modelo base; tamaño de cada adaptador LoRA no disponible (repositorio completo de 0,7 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; en TTS el condicionamiento se hace sobre audio de referencia, no sobre una ventana de tokens de texto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (ru) |
| Licencia | CC0-1.0 |
| Formato de pesos | safetensors (adaptadores LoRA), distribuidos además como paquetes `.zip` con `SHA256SUMS.txt` |

## Arquitectura y entrenamiento

La base es Qwen3-TTS-12Hz-1.7B-Base, un modelo de text-to-speech de 1.700 millones de parámetros cuyo nombre sugiere una representación de audio a 12 Hz, aunque la model card no detalla la arquitectura interna ni el tokenizador de audio. Sobre ese modelo se han entrenado seis adaptadores LoRA independientes, uno por voz, mediante ajuste fino supervisado sobre grabaciones individuales. No se especifican hiperparámetros, número de pasos, duración total de audio empleada ni si hubo etapas de RLHF o DPO; el autor solo indica que cada voz se entrenó exclusivamente a partir de una lectura en solitario de LibriVox.

Las seis fuentes son: cuentos de Chéjov (lector Виталий, colección Multilingual Short Works Collection 037) para `levi`; «Детство» de Tolstói, versión 2 (Victor Seremet) para `natan`; «Ангелочек» de Andréyev (lector Create, Christmas Short Works Collection 2009) para `shimon`; «Портреты русских поэтов» de Ehrenburg (Maya S) para `miriam`; «Горе от ума» de Griboyédov (Irina Grinberg) para `rivka`; y «Избранные» de Sholem Aleichem (Hanna Ponomarenko) para `noa`. Tres voces son masculinas y tres femeninas. La innovación destacable no es técnica sino de procedencia y licencia: audio de dominio público y liberación del resultado bajo CC0-1.0.

## Capacidades

- Síntesis de voz en ruso a partir de texto, con seis voces fijas preentrenadas (tres masculinas y tres femeninas).
- Clonación de voz mediante adaptadores LoRA: cada voz reproduce el timbre derivado de su grabación de origen, no una voz sintética genérica.
- Narración de audiolibros, que es el caso de uso para el que se empaquetaron las voces dentro de la aplicación Voxprint.
- Integración en la aplicación Voxprint mediante el menú *Voices → catalog* o el comando `voxprint voices download <id>`.
- Distribución verificable: cada paquete incluye su model card y un archivo `SHA256SUMS.txt` con los hashes SHA-256.
- Uso comercial permitido por la licencia CC0-1.0 de los adaptadores.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada para transcripción ni otras capacidades multimodales.

## Casos de uso

- Producción de audiolibros en ruso: el flujo natural es alimentar el texto de una obra al modelo base con uno de los adaptadores y obtener narración continua; la propia existencia de Voxprint como herramienta de audiolibros confirma que este es el escenario principal.
- Audiolibros de dominio público con cadena de derechos limpia: al derivar de lecturas de LibriVox y publicarse bajo CC0-1.0, se pueden comercializar las obras resultantes sin negociar derechos de voz, algo que con otras voces clonadas no siempre es posible.
- Contenido educativo y cursos en ruso: seis voces distintas permiten asignar narradores diferentes a módulos, secciones o personajes, manteniendo coherencia tímbrica dentro de cada bloque.
- Accesibilidad y lectura asistida: conversión de documentos, apuntes o artículos a audio para personas con dificultades de lectura o para consumo en movilidad.
- Locución para vídeo y pódcast en ruso: generación de pistas de voz para piezas cortas donde no se necesita un actor de doblaje, con la ventaja de que el uso comercial está permitido.
- Prototipado de productos de voz: evaluación de una voz rusa concreta antes de invertir en una grabación profesional, usando el adaptador como referencia de timbre y prosodia.
- Investigación sobre adaptación eficiente: al ser LoRA sobre un backbone de 1,7B, sirve como material para estudiar el ajuste de parámetros eficiente aplicado a TTS y comparar cuánta identidad de voz se conserva con pocos parámetros entrenables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, similitud de hablante, WER de inteligibilidad), ni comparaciones con otras voces rusas, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para el modelo base en precisión completa (FP16/BF16): en torno a 3,4 GB solo para pesos, con aproximadamente 4-5 GB de VRAM para inferencia. Son estimaciones a partir del tamaño declarado de 1,7B parámetros, no cifras publicadas por el autor.
- VRAM estimada con cuantización de 8 bits: aproximadamente 1,7 GB de pesos y 2,5 GB de VRAM total; con 4 bits, alrededor de 0,9 GB de pesos y 1,5-2 GB de VRAM. Los formatos de cuantización concretos soportados no están disponibles.
- Adaptadores LoRA: al ser adaptadores, su huella adicional es pequeña comparada con el backbone; el repositorio completo ocupa 0,7 GB.
- GPU recomendadas: el tamaño de 1,7B permite ejecución en GPU de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores. Para lotes grandes o generación de audiolibros extensos, una RTX 4090 o una GPU de centro de datos (A100, H100) reduce el tiempo total, aunque no es imprescindible.
- Caben en GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM en FP16, y en menos si se cuantiza.
- Opciones de despliegue: la vía documentada es la aplicación Voxprint y su comando `voxprint voices download <id>`. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, ni si existen pesos en formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Voxprint voices ru | LoRA de clonación de voz sobre Qwen3-TTS-12Hz-1.7B | 1,7B en el base, adaptadores no cuantificados | ruso | CC0-1.0 | Seis voces fijas, procedencia LibriVox, uso comercial sin restricciones |
| Qwen3-TTS-12Hz-1.7B-Base | TTS base | 1,7B | no disponible en esta búsqueda | no disponible en esta búsqueda | Modelo subyacente sin las voces rusas añadidas |
| XTTS-v2 (Coqui) | TTS con clonación zero-shot | no disponible en esta búsqueda | multilingüe | licencia específica de Coqui, con restricciones de uso comercial | Referencia habitual de clonación zero-shot; conviene verificar condiciones antes de uso comercial |

Los datos de los modelos alternativos proceden de conocimiento general y no se han verificado en la búsqueda realizada; deben comprobarse en sus repositorios oficiales antes de tomar decisiones. No hay datos de rendimiento comparado para Voxprint voices ru.

## Limitaciones y advertencias

- Solo ruso: la tarjeta declara exclusivamente `ru`; no se documenta soporte multilingüe.
- Seis voces cerradas: el conjunto ofrece seis identidades fijas, no clonación arbitraria de cualquier voz que aporte el usuario.
- Entrenamiento con una única grabación por voz: la expresividad, el rango emocional y la variedad prosódica quedan limitados a lo presente en esa lectura, normalmente una lectura neutra en solitario.
- Calidad dependiente de la fuente: las grabaciones de LibriVox son de dominio público, pero su calidad de captura y nivel de ruido son variables y pueden reflejarse en la salida.
- Sin benchmarks publicados: no hay MOS, similitud de hablante ni medidas de inteligibilidad que permitan estimar la calidad con datos.
- Riesgo de alucinación acústica: como en cualquier TTS, el modelo puede producir pronunciaciones incorrectas, omisiones o artefactos en palabras poco frecuentes, nombres propios o texto con números y abreviaturas.
- Licencia de los adaptadores frente a la del modelo base: los LoRA se publican como CC0-1.0, pero la licencia de Qwen3-TTS-12Hz-1.7B-Base es independiente y debe consultarse antes de redistribuir o desplegar el conjunto completo.
- Nombres de las voces: la propia model card aclara que los nombres son propios de Voxprint y no implican el respaldo de los lectores originales de LibriVox.
- Validación comunitaria nula: cero descargas y cero valoraciones en el momento de la consulta, sin evidencia de uso en producción por terceros.
- Fechas del repositorio: la creación y la última actualización aparecen en octubre de 2026 con apenas siete segundos de diferencia, sin historial de revisiones visible.

## Enlaces

- HuggingFace: https://huggingface.co/Mitroshenkov87/voxprint-voices-ru
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio de la aplicación Voxprint: https://github.com/Mitroshenkov87/voxprint-audiobook-builder
- LibriVox (origen de las grabaciones de dominio público): https://librivox.org
- Colecciones citadas en la model card: Multilingual Short Works Collection 037, Christmas Short Works Collection 2009
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a páginas no relacionadas.
