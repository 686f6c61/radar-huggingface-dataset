# darkmaniac7/TokForge-Bonsai-2-27B-GGUF

## Resumen

TokForge-Bonsai-2-27B-GGUF es una distribución de pesos en formato GGUF del modelo Ternary Bonsai 2 27B de Prism ML, publicada por TokForge para inferencia en dispositivo (on-device) en teléfonos Android. El modelo subyacente es una adaptación ternaria de Qwen3.8-27B de Alibaba Cloud, con 26.895.998.464 parámetros totales y entrenamiento ternario, lo que permite empaquetados de muy baja precisión (1,75 y 2,13 bits por peso) que reducen el peso de los ficheros a entre 5,95 GB y 7,21 GB.

El repositorio no aporta pesos nuevos del modelo: los ficheros PQ2_0 y PTQ1_0 son byte-idénticos al release upstream de Prism ML en la revisión `6ed5e12bf84b7a63069882c91dd9e9218647d17b`. El valor añadido de TokForge es el runtime Android (kernels Vulkan y CPU para estos empaquetados), la configuración de inferencia probada por clase de teléfono y un fichero adicional que injerta una cabeza de predicción multi-token (MTP) para decodificación especulativa en la ruta CPU.

Es relevante porque demuestra la viabilidad de ejecutar un modelo de ~27B parámetros en un teléfono de 16 GB de RAM mediante cuantización ternaria extrema y kernels GPU Vulkan específicos para Snapdragon. La licencia Apache-2.0 y la disponibilidad de los pesos en GGUF facilitan su evaluación sin depender de infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B), con entrenamiento ternario; metadatos GGUF bajo clave `qwen35.*` |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Ternaria: PQ2_0 (2,13 bits/peso) y PTQ1_0 (1,75 bits/peso); cabeza MTP adicional en Q8_0 |
| Idiomas soportados | Ingles (segun metadatos del repo) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el repo upstream incluye tambien F16 y proyector de vision (mmproj) |

## Arquitectura y entrenamiento

El modelo base es Ternary Bonsai 2 27B de Prism ML, construido a partir de Qwen3.8-27B de Alibaba Cloud mediante un proceso de entrenamiento ternario propietario de Prism ML. La arquitectura es un transformer denso con 64 bloques (el fichero con MTP eleva `qwen35.block_count` a 65 e introduce `qwen35.nextn_predict_layers = 1`). Los metadatos GGUF incluyen claves `prism.hadamard.*`, lo que sugiere el uso de transformadas de Hadamard en el pipeline de cuantización ternaria, aunque la model card no detalla el procedimiento completo.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica destacable es doble: por un lado, el entrenamiento ternario que permite empaquetados por debajo de 2 bits por peso manteniendo un modelo de ~27B; por otro, la cabeza MTP injertada por TokForge en el fichero PTQ1_0-MTP, que permite decodificación especulativa con verificación por el modelo completo (un token draft solo se conserva si el modelo completo lo habría producido). El injerto preserva byte a byte los 851 tensores originales y es reversible: eliminar la cabeza devuelve exactamente el fichero upstream (sha256 `53107f530aa52eb00912263ab1ee29bd199261c87cd7b4ad4ca1318c1fe33ee3`).

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta multi-turno en chats, según el uso previsto por TokForge.
- Decodificación especulativa mediante cabeza MTP opcional en la ruta CPU (solo fichero `PTQ1_0-MTP`).
- Inferencia totalmente offline una vez descargado el modelo.
- Ejecución en GPU Vulkan en teléfonos Snapdragon 8 Elite Gen 5 y 8 Gen 3 no Samsung; ruta CPU en el resto.
- Capacidades de visión: el repo upstream incluye ficheros mmproj, pero TokForge indica que no los usa todavía; no disponibles en esta distribución.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Multilingüismo: limitado a inglés según los metadatos.

## Casos de uso

- Asistente conversacional offline en Android: el modelo se carga en la app TokForge y permite chatear sin conexión una vez descargado, adecuado para escenarios de privacidad o conectividad intermitente.
- Evaluación de cuantización ternaria en investigación: los ficheros PQ2_0 y PTQ1_0 permiten medir la degradación de calidad de un modelo de ~27B a 1,75-2,13 bits/peso frente al F16 upstream.
- Pruebas de decodificación especulativa en dispositivo: el fichero con cabeza MTP permite experimentar con drafting multi-token y verificación por el modelo completo en la ruta CPU de llama.cpp.
- Desarrollo de kernels Vulkan/Adreno: el runtime de TokForge y el `manifest.json` con medidas por teléfono sirven como referencia para implementar kernels de empaquetados ternarios en GPUs móviles.
- Benchmarking de inferencia móvil: el `manifest.json` documenta rutas y ajustes por clase de dispositivo, útil para comparar latencia y throughput entre Snapdragon 8 Elite Gen 5, 8 Gen 3 y CPU.
- Prototipado de aplicaciones Android con llama.cpp: al ser GGUF compatible con llama.cpp y con `endpoints_compatible`, puede integrarse en apps que ya usan el ecosistema llama.cpp para inferencia local.
- Distribución de modelos de gran tamaño en móvil: caso de estudio de empaquetado y verificación por SHA-256 para releases de pesos de ~6-7 GB en repositorios de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- RAM del dispositivo: 16 GB o más; los teléfonos de 12 GB no han sido probados según la model card.
- VRAM estimada para inferencia: no aplica en el caso móvil; el peso en disco es de 7,21 GB (PQ2_0), 5,95 GB (PTQ1_0) y 6,40 GB (PTQ1_0-MTP).
- GPU recomendadas en móvil: Snapdragon 8 Elite Gen 5 y Snapdragon 8 Gen 3 (no Samsung) para la ruta Vulkan; el Snapdragon 8 Elite original (SM8750) queda en ruta CPU.
- GPU de escritorio/servidor: no se documentan requisitos ni recomendaciones en la informacion disponible.
- Cabe en GPU consumer: no disponible; el enfoque del release es Android.
- Opciones de despliegue: app TokForge (Google Play, versión 1.3.4 o superior; 1.3.9 o superior para la cabeza MTP); llama.cpp con soporte de los empaquetados PQ2_0/PTQ1_0; TestFlight en iOS.
- Latencia y throughput: no disponibles; el `manifest.json` contiene medidas por teléfono, pero no se recogen cifras en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| TokForge-Bonsai-2-27B-GGUF | ~26,9B | no disponible | Ternaria (1,75-2,13 bits/peso) | Apache-2.0 | On-device Android |
| prism-ml/Ternary-Bonsai-2-27B-gguf (upstream) | ~26,9B | no disponible | Ternaria + F16 + mmproj | Apache-2.0 | Pesos base y vision |
| Qwen3.8-27B (modelo origen) | ~27B | no disponible | No disponible | No disponible | Modelo denso original |
| Alternativas GGUF de ~27B en llama.cpp | ~27B | no disponible | Q4_K_M, Q5_K_M, etc. | Variable | Servidor/escritorio |

La comparación con alternativas de la misma categoría (modelos ternarios on-device) no está disponible en la información proporcionada. Frente a cuantizaciones convencionales de 4-5 bits, el empaquetado ternario reduce el peso a menos de la mitad, a costa de una precisión por peso mucho menor.

## Limitaciones y advertencias

- Idiomas: solo inglés según los metadatos; no se garantiza calidad en castellano ni en otros idiomas.
- Contexto: la longitud de contexto no se documenta en la información disponible; no debe asumirse una ventana larga.
- Alucinación: no hay datos de evaluación de fidelidad; un modelo ternario de este tamaño puede degradar el razonamiento respecto al F16 original.
- Visión: el proyector mmproj existe en el repo upstream pero TokForge no lo utiliza; no hay capacidades multimodales en esta distribución.
- Hardware: requiere 16 GB de RAM; los teléfonos de 12 GB no están probados. La ruta GPU Vulkan está limitada a Snapdragon 8 Elite Gen 5 y 8 Gen 3 no Samsung.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse el aviso de Prism ML (`NOTICE.txt`) y verificarse las condiciones del modelo base Qwen3.8-27B.
- Integridad: los ficheros deben verificarse con `SHA256SUMS`; el fichero MTP modifica cabeceras (`qwen35.block_count`, `qwen35.nextn_predict_layers`) y solo debe usarse con versiones de TokForge que lo soporten.
- Producción: no hay benchmarks publicados ni datos de latencia/throughput; la idoneidad para producción en servidor no está evaluada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/darkmaniac7/TokForge-Bonsai-2-27B-GGUF
- Modelo base upstream: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo origen: https://huggingface.co/Qwen/Qwen3.8-27B
- Organización Prism ML: https://huggingface.co/prism-ml
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (app TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- Colección TokForge Bonsai 2 Ternary Models: https://huggingface.co/collections/darkmaniac7/tokforge-bonsai-2-ternary-models-6af3fdd7a548b444c61a1982
- Colección TokForge GGUF Models: https://huggingface.co/collections/darkmaniac7/tokforge-gguf-models-6af3fdd830c420213916bda1
