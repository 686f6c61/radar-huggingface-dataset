# MercanAI/Mercan-LFM3-1.7B-SFT-8K-Q4_K_M

## Resumen

Mercan-LFM3-1.7B-SFT-8K-Q4_K_M es un checkpoint intermedio de ajuste supervisado (SFT) publicado por MercanAI sobre el modelo base LiquidAI/LFM3-1.7B-Base de Liquid AI. Se trata del paso 8.000 de un entrenamiento SFT previsto de 33.079 pasos, construido a partir de un modelo previo que completó un preentrenamiento continuado (CPT) de 10.000 millones de tokens en turco. El modelo está orientado a generación de texto conversacional multi-turno en turco e inglés.

La relevancia de esta publicación es doble: por un lado, documenta una cadena de entrenamiento poco habitual (CPT en turco sobre una arquitectura LFM3 y posterior SFT asistente), y por otro, distribuye el resultado en un formato propietario denominado Mercan (`model.mercan`), empaquetado sobre GGUF v3, pensado para su ejecución en iOS mediante el runtime MercanRuntime. El checkpoint no es el artefacto final del entrenamiento ni ha pasado por DPO.

El modelo se distribuye cuantizado en Q4_K_M, con pesos exportados en una GPU NVIDIA H200 desde FP32 a BF16 y posteriormente convertidos a GGUF mediante llama.cpp. No se han publicado benchmarks independientes ni evaluaciones de seguridad, y el propio autor lo etiqueta explícitamente como checkpoint intermedio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM3 (`general.architecture = lfm3`), transformer de Liquid AI |
| Parámetros totales | 1,7 mil millones (derivados del nombre y del modelo base LFM3-1.7B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el sufijo "8K" del nombre no se confirma como contexto en la model card) |
| Tipos de cuantización | Q4_K_M |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | LFM Open License v1.0 (`lfm1.0`, etiquetada como `other`) |
| Formato de pesos | GGUF v3 (`model.gguf`) y Mercan v1 sobre GGUF v3 (`model.mercan`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura LFM3 de Liquid AI en su variante de 1,7 mil millones de parámetros. La cadena de entrenamiento documentada es la siguiente: primero un CPT (continued pre-training) de 10.000 millones de tokens en turco sobre el modelo base, después un SFT assistant-only sobre una mezcla denominada Mercan-TR-SFT-Mix más 506.374 conversaciones multi-turno externas. Este checkpoint corresponde al paso 8.000 de los 33.079 previstos, con 847.901.699 tokens de pérdida supervisada procesados hasta ese punto. No se ha aplicado DPO en esta versión.

El autor reporta una validación NLL de 0,890927 sobre una muestra retenida de 531.502 tokens supervisados, dato que debe interpretarse con cautela al no existir evaluación independiente. La exportación se realizó en una NVIDIA H200 con pesos en FP32 convertidos a BF16 y después a GGUF Q4_K_M mediante llama.cpp. El tokenizer no se modificó y se documenta su SHA-256 (`7e226e34bface23ccf6e495d157bf77186c1c30a7659880e1a8994db528c3701`). El empaquetado Mercan preserva los 288 tensores cuantizados y solo añade claves de formato (`mercan.format`, `mercan.runtime_abi = 1`, `mercan.model_family = LFM3`, `mercan.tokenizer.type = gguf-vocab`).

## Capacidades

- Generación de texto conversacional multi-turno en turco e inglés, con entrenamiento específico assistant-only.
- Razonamiento y respuesta a instrucciones derivados del SFT sobre conversaciones multi-turno.
- Soporte nativo de la arquitectura LFM3 en runtimes compatibles (llama.cpp para el GGUF, MercanRuntime para el formato `model.mercan`).
- Ejecución en dispositivos iOS a través de MercanRuntime, con importación por URL o fichero local.
- Capacidad multilingüe limitada a turco e inglés según la model card; no se documentan otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistentes conversacionales en turco para aplicaciones móviles iOS: el modelo puede integrarse mediante MercanRuntime e importarse en la app con la URL directa del fichero `model.mercan`, lo que permite desplegar un asistente local sin depender de servidores externos.
- Prototipado de chatbots multi-turno en turco: al haber sido entrenado sobre 506.374 conversaciones multi-turno, es adecuado para validar flujos de diálogo con contexto conversacional antes de invertir en un modelo mayor.
- Evaluación de la cadena CPT + SFT sobre LFM3: sirve como referencia intermedia para estudiar la evolución de la pérdida y la calidad conversacional entre el paso 8.000 y el paso final de 33.079.
- Investigación sobre formatos de empaquetado: el fichero `model.mercan` y el script `gguf_to_mercan.py` permiten estudiar la envoltura de GGUF para runtimes móviles y verificar la integridad de los 288 tensores mediante el audit JSON incluido.
- Despliegue local con llama.cpp: el `model.gguf` en Q4_K_M puede cargarse en clientes llama.cpp para pruebas de generación de texto en entornos de escritorio o servidor ligero.
- Base para futuros ajustes DPO: al ser un checkpoint intermedio sin DPO, puede utilizarse como punto de partida para experimentos de alineación posteriores sobre la misma mezcla SFT.
- Pruebas de integración en pipelines de CI: los ficheros de checksum (`model.mercan.sha256`) y el audit de conversión permiten automatizar verificaciones de integridad en procesos de distribución de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de evaluación reportado por el autor es la NLL de validación en el paso 8.000 (0,890927 sobre 531.502 tokens supervisados), que no es comparable con métricas estándar como MMLU, HumanEval o GSM8K. El autor indica además que este checkpoint intermedio no ha sido evaluado de forma independiente ni sometido a evaluación de seguridad en móvil.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 1,7B en Q4_K_M el peso de los parámetros ronda los 1 GB, aunque la model card no publica cifras de memoria.
- GPU recomendadas: no disponible. La exportación se realizó en una NVIDIA H200, pero no se documentan requisitos de inferencia.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño, un modelo de 1,7B en Q4_K_M es candidato a ejecutarse en GPU de consumo, pero el autor no lo verifica.
- Opciones de despliegue: llama.cpp para `model.gguf`; MercanRuntime (rama `ios-lfm`) para `model.mercan` en iOS.
- Latencia y throughput: no disponibles. El autor advierte que el rendimiento depende del dispositivo y de la build concreta de la aplicación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Mercan-LFM3-1.7B-SFT-8K-Q4_K_M | 1,7B | no disponible | tr, en | LFM Open License v1.0 | GGUF, Mercan | Checkpoint intermedio SFT, sin benchmarks |
| LiquidAI/LFM3-1.7B-Base | 1,7B | no disponible | no disponible | LFM Open License v1.0 | safetensors (formato habitual del base) | Modelo base oficial de Liquid AI, sin SFT específico en turco |
| Modelos de ~1,7B en Q4_K_M de otras familias | ~1,7B | variable | variable | variable | GGUF | No se dispone de datos comparativos verificados en la información proporcionada |

La comparación cuantitativa con alternativas no está disponible: no se han publicado benchmarks de este checkpoint ni de su modelo base en la información consultada, por lo que no es posible establecer diferencias de rendimiento objetivas.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 8.000 de 33.079, por lo que su calidad conversacional es inferior a la del modelo final previsto y no debe tratarse como versión de producción.
- Sin DPO: no ha pasado por entrenamiento de preferencias, de modo que puede presentar respuestas menos alineadas con expectativas de utilidad o seguridad.
- Sin evaluación independiente: no hay benchmarks públicos ni auditoría de seguridad, y el autor lo declara explícitamente.
- Riesgo de alucinación: no cuantificado; al ser un modelo de 1,7B con SFT parcial, es esperable un comportamiento propenso a errores factuales, aunque no se aportan datos al respecto.
- Cobertura lingüística limitada a turco e inglés; no se documenta calidad en otros idiomas.
- Restricciones de licencia: LFM Open License v1.0 (etiquetada como `other`); deben revisarse sus términos antes de cualquier uso comercial, ya que no es una licencia permisiva estándar tipo Apache o MIT.
- Dependencia de runtime propietario: el formato `model.mercan` requiere una build específica de MercanRuntime con soporte LFM3 y proveedor de tokenizer `gguf-vocab`; la rama `main` antigua no es compatible.
- Longitud de contexto no confirmada: el sufijo "8K" del nombre no se aclara en la model card como ventana de contexto, por lo que no debe asumirse.
- Sesgos: no documentados por el autor; al incluir CPT en turco y conversaciones externas, pueden heredarse sesgos de esos corpus sin evaluación publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MercanAI/Mercan-LFM3-1.7B-SFT-8K-Q4_K_M
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Script de conversión GGUF a Mercan: https://github.com/Ahmet2001/MercanRuntime/blob/ios-lfm/scripts/gguf_to_mercan.py
- Repositorio MercanRuntime: https://github.com/Ahmet2001/MercanRuntime
- Descarga directa del fichero Mercan: https://huggingface.co/MercanAI/Mercan-LFM3-1.7B-SFT-8K-Q4_K_M/resolve/main/model.mercan
