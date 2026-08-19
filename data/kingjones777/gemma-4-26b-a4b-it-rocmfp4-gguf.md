# kingjones777/Gemma-4-26B-A4B-it-ROCmFP4-GGUF

## Resumen

Este repositorio contiene la primera cuantización en formato ROCmFP4 y ROCmFPX del modelo `google/gemma-4-26B-A4B-it`, creada por el usuario kingjones777. Se trata de un modelo de lenguaje multimodal de Google DeepMind, con arquitectura Mixture of Experts (MoE) de 26.000 millones de parámetros totales y aproximadamente 4.000 millones activos por token. El objetivo principal es ofrecer una versión cuantizada optimizada para hardware AMD, específicamente para la APU Strix Halo (gfx1151, Ryzen AI MAX+ 395), utilizando el fork ROCmFPX de llama.cpp.

El repositorio incluye cuatro variantes de cuantización (Q4_0_ROCMFP4_COHERENT, Q6_0_ROCMFPX_AGENT, Q8_0_ROCMFPX y Q8_0_ROCMFPX_AGENT), junto con un modelo auxiliar para decodificación especulativa (drafter MTP) y un proyector de visión en BF16. Todas las variantes han sido verificadas tanto para generación de texto como para entrada de imágenes en hardware real. La relevancia de esta publicación radica en que acerca un modelo MoE multimodal de alto rendimiento a equipos AMD de gama alta, un segmento tradicionalmente menos cubierto por las cuantizaciones estándar, que suelen priorizar CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) multimodal, transformer con atención estándar |
| Parametros totales | 25.233.142.046 (~26B) |
| Parametros activos | ~4B por token |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT (4,57 BPW), Q6_0_ROCMFPX_AGENT (7,42 BPW), Q8_0_ROCMFPX (8,27 BPW), Q8_0_ROCMFPX_AGENT (8,39 BPW) |
| Idiomas soportados | Más de 140 idiomas |
| Licencia | Gemma (sujeta a los términos de uso de Gemma) |
| Formato de pesos | GGUF con tipos de tensor ROCmFP4/ROCmFPX (no estándar) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it` es un MoE multimodal que procesa entradas de texto e imagen y genera salidas de texto. La arquitectura combina una capa FFN compartida (`ffn_down`, `ffn_gate`, `ffn_up`) con expertos enrutados (`ffn_down_exps`, `ffn_gate_up_exps`), sin tensores `*_shexp`. El modelo emplea `tie_word_embeddings`, por lo que no existe un tensor `output.weight` separado. Google DeepMind entrenó el modelo con un enfoque de IA responsable, incluyendo alineación mediante instrucciones, y lo publicó bajo la licencia Gemma.

La cuantización ROCmFPX se construyó a partir del GGUF BF16 oficial del Hub, sin reconversión. El autor verificó la integridad de los archivos mediante comparación de tamaños con `--dry-run` y auditaron el tensor `token_embd` por nombre exacto. La decodificación especulativa se implementa mediante un drafter MTP (multi-token prediction) separado, que se carga como modelo auxiliar. El autor midió una tasa de aceptación de tokens del drafter de 0,727 a 0,779 según la variante, con una longitud media aceptada de 2,75 a 2,82 tokens.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, con capacidad multimodal de entrada de imágenes y salida de texto.
- Soporte de tool calling / function calling, según las especificaciones del modelo base.
- Capacidad para tareas de agente y razonamiento multi-paso.
- Soporte multilingüe en más de 140 idiomas.
- Decodificación especulativa (MTP) con drafter incluido, que acelera la generación entre 1,03 y 1,15 veces.
- Procesamiento de imágenes con proyector de visión BF16 incluido (verificado con una imagen de 512x512 de cuatro colores).
- Limitación: la visión y la decodificación especulativa no pueden activarse simultáneamente.

## Casos de uso

- Asistentes de chat locales en hardware AMD Strix Halo: el modelo puede ejecutarse en un portátil o mini PC con Ryzen AI MAX+ 395 y 128 GB de memoria unificada, ofreciendo una experiencia conversacional fluida con velocidades de hasta 58 t/s en la variante Q4.
- Generación de código en entornos de desarrollo: con soporte de tool calling, puede integrarse en IDEs o pipelines de CI/CD para sugerencias de código, revisión y autocompletado, aprovechando el contexto de 256K tokens para manejar repositorios extensos.
- Procesamiento de documentos con imágenes: al ser multimodal, puede analizar capturas de pantalla, diagramas o documentos escaneados y generar descripciones, resúmenes o respuestas, útil en entornos corporativos con requisitos de privacidad.
- Traducción y localización multilingüe: con soporte de más de 140 idiomas, puede emplearse como motor de traducción automática en aplicaciones de atención al cliente o publicación de contenido.
- Agentes autónomos para automatización de tareas: el modelo puede razonar en múltiples pasos, llamar a herramientas y mantener contexto largo, lo que lo hace adecuado para orquestar flujos de trabajo complejos en sistemas de gestión empresarial.
- Desarrollo de aplicaciones con datos sensibles: al ejecutarse localmente en hardware AMD, permite desplegar un LLM sin enviar datos a la nube, cumpliendo requisitos de soberanía de datos en sectores como salud, banca o administración pública.
- Investigación y prototipado de modelos MoE: la disponibilidad de cuantizaciones con distintos niveles de precisión permite estudiar el equilibrio entre velocidad, memoria y calidad en arquitecturas MoE multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones propias de rendimiento en hardware específico, reproducidas en la siguiente tabla.

Hardware de prueba: Ryzen AI MAX+ 395 (Strix Halo, gfx1151), 128 GB unificados, ROCm 7.2.4. Decodificación medida sobre 300 tokens con prompt de código, mediana de 3 ejecuciones.

| Variante | Tamaño | Velocidad con MTP (t/s) | Velocidad sin MTP (t/s) | Tasa de aceptación del drafter |
|---|---:|---:|---:|---:|
| Q4_0_ROCMFP4_COHERENT | 13,45 GiB | 58,31 | 56,71 | 0,727 |
| Q6_0_ROCMFPX_AGENT | 21,81 GiB | 45,33 | 43,39 | 0,739 |
| Q8_0_ROCMFPX | 24,30 GiB | 46,50 | 41,84 | 0,779 |
| Q8_0_ROCMFPX_AGENT | 24,67 GiB | 47,58 | 41,34 | 0,760 |

La verificación de visión se completó correctamente en 4 de 4 pruebas con una imagen de cuatro colores. El autor señala que la ganancia de la decodificación especulativa es modesta (1,03-1,15 veces) porque el MoE ya es rápido al leer solo ~4B parámetros activos por token.

## Requisitos de hardware

- GPU o APU AMD con arquitectura gfx1151 (Strix Halo), como el Ryzen AI MAX+ 395 con 128 GB de memoria unificada.
- ROCm 7.2.4 o superior.
- Build de llama.cpp con soporte ROCmFPX (fork de charlie12345/ROCmFPX). No compatible con llama.cpp estándar, Ollama ni LM Studio.
- Memoria: los archivos GGUF ocupan entre 13,45 GiB y 24,67 GiB, por lo que se recomienda al menos 32 GB de RAM unificada para la variante Q4 y 64 GB para las variantes Q8.
- Ancho de banda efectivo estimado: ~130 GB/s para la variante Q4 y ~173 GB/s para las Q8, calculado sobre los ~4B parámetros activos.
- Opciones de despliegue: `llama-server` del fork ROCmFPX con soporte de decodificación especulativa (`--spec-type draft-mtp`) y proyector de visión.
- No es compatible con GPUs NVIDIA o hardware sin soporte ROCmFPX.

## Comparativa con modelos similares

La comparativa se centra en la capa de cuantización, ya que el modelo base es el mismo. No se dispone de datos de rendimiento de otras cuantizaciones en hardware equivalente.

| Modelo | Parámetros totales | Activos | Contexto | Formato | Hardware objetivo |
|---|---|---|---|---|---|
| google/gemma-4-26B-A4B-it (BF16) | 25,2B | ~4B | 256K | safetensors | Multiplataforma |
| kingjones777/Gemma-4-26B-A4B-it-ROCmFP4-GGUF | 25,2B | ~4B | 256K | GGUF ROCmFPX | AMD gfx1151 |
| unsloth/gemma-4-26B-A4B-it-GGUF | 25,2B | ~4B | 256K | GGUF estándar | CPU/CUDA/AMD (con limitaciones) |

La principal diferencia frente a la cuantización de unsloth es que la versión ROCmFPX emplea tipos de tensor propietarios que requieren el fork específico de llama.cpp, mientras que la de unsloth es compatible con el ecosistema estándar. Sin embargo, la versión ROCmFPX está optimizada para el hardware AMD Strix Halo y ofrece velocidades verificadas en ese entorno.

## Limitaciones y advertencias

- Requiere un build de llama.cpp con soporte ROCmFPX; los archivos no se cargan en llama.cpp estándar, Ollama ni LM Studio.
- La decodificación especulativa (MTP) y la visión no pueden utilizarse simultáneamente; pasar una imagen con el drafter cargado provoca un fallo fatal del servidor.
- La ganancia de velocidad por decodificación especulativa es modesta (1,03-1,15 veces), inferior a la observada en modelos densos.
- El formato ROCmFPX está limitado a hardware AMD con arquitectura gfx1151; no es portable a otras plataformas.
- La licencia Gemma impone restricciones de uso comercial y requiere aceptar los términos de Google; no se permite el uso para fines contrarios a las políticas de uso aceptable.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las cifras de rendimiento son mediciones propias del autor en un único hardware.
- El modelo puede presentar sesgos y alucinaciones inherentes a los LLM; se recomienda validar las salidas en aplicaciones de producción.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/kingjones777/Gemma-4-26B-A4B-it-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Página oficial de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentación de Google Cloud para Gemma 4 26B A4B IT: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Especificaciones y proveedores en Models.dev: https://models.dev/models/google/gemma-4-26b-a4b-it/
