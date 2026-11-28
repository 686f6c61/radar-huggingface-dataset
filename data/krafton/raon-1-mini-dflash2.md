# KRAFTON/Raon-1-mini-dflash2

## Resumen

Raon-1-mini-dflash2 es el modelo borrador (draft model) de decodificación especulativa del modelo Raon-1 mini, desarrollado por KRAFTON AI. No se trata de un modelo autónomo: su función es proponer tokens candidatos que el modelo principal Raon-1 mini verifica en paralelo, acelerando así la generación sin alterar la distribución de salida. Se publica bajo licencia Apache 2.0 y está pensado para desplegarse con vLLM, la única librería declarada en sus metadatos.

El modelo principal al que acompaña, Raon-1 mini, es un MoE híbrido de 28,8B parámetros totales y 4,3B activos por token, entrenado desde cero por KRAFTON AI con un enfoque explícito en conversación en coreano y tareas agénticas. Emplea una arquitectura poco habitual: 18 capas de atención lineal (Raon Delta Attention) y 7 capas de atención completa con MLA, sin codificación posicional (NoPE), y soporte nativo de 262.144 tokens de contexto.

La relevancia de este repositorio es práctica: la decodificación especulativa es una de las vías más eficaces para reducir la latencia en inferencia de modelos grandes sin recurrir a cuantizaciones agresivas, y disponer del draft model oficial dentro del ecosistema vLLM simplifica su adopción en producción. El repositorio pesa 1,4 GB y contiene 677.776.640 parámetros en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo borrador de decodificación especulativa (DFlash2) sobre base Qwen3; el modelo principal es un MoE híbrido con RDA y Gated MLA |
| Parámetros totales | 677.776.640 (modelo borrador); 28,8B en el modelo principal Raon-1 mini |
| Parámetros activos | No aplica al borrador; 4,3B en el modelo principal (6 de 128 expertos enrutados + 1 compartido) |
| Longitud de contexto | No especificada para el borrador; 262.144 tokens en el modelo principal |
| Tipos de cuantización | El borrador se distribuye en safetensors; el modelo principal ofrece MXFP8 y NVFP4 |
| Idiomas soportados | No disponible para el borrador; el modelo principal se entrenó en coreano, inglés, japonés, chino, español, francés y tailandés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente el draft model DFlash2, diseñado para integrarse en el mecanismo de decodificación especulativa de vLLM junto a Raon-1 mini. Los tags del repositorio indican una base Qwen3 para el borrador, lo que sugiere que la cabeza predictora reutiliza componentes de esa familia. No se han publicado detalles sobre el proceso de entrenamiento del borrador, el volumen de datos utilizado ni la metodología de destilación o alineación empleada para generarlo.

El modelo principal, Raon-1 mini, presenta una arquitectura MoE híbrida de 25 capas con 2.560 de dimensión oculta. Dieciocho capas usan Raon Delta Attention (RDA), una variante que desacopla las compuertas de borrado y escritura de Kimi Delta Attention para mejorar el rendimiento en contexto largo, y siete capas usan Gated MLA con caché KV de aproximadamente 8 KiB por token en BF16. Incorpora Raon-mHC como conexión residual, una versión optimizada de las hyper-connections con restricción de variedad de DeepSeek, y prescinde de codificación posicional (NoPE). La función de activación es SiTU-GLU y el tamaño intermedio de experto es 1.088. No se dispone de datos sobre el número de tokens de entrenamiento ni sobre las etapas de RLHF o DPO aplicadas.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: propone tokens candidatos que Raon-1 mini valida, reduciendo la latencia por token generado.
- Integración nativa con vLLM, declarada como librería principal del repositorio.
- No es un modelo generativo autónomo: no debe usarse de forma aislada para generación de texto, razonamiento, código ni tareas multimodales.
- Hereda del modelo principal, cuando se despliega junto a él, las capacidades de razonamiento con seis niveles de esfuerzo (`none`, `low`, `medium`, `high`, `xhigh`, `max`), tool calling para flujos agénticos y conversación multi-turno.
- El modelo principal soporta agentes como Hermes Agent, Pi y OpenCode, y presenta capacidades multilingües en siete idiomas.

## Casos de uso

- Servicio de chat de baja latencia: desplegar Raon-1 mini con este draft model en vLLM reduce el tiempo hasta el primer token percibido en conversaciones multi-turno, aprovechando el contexto de 262.144 tokens del modelo principal para hilos largos.
- Asistentes agénticos en producción: al combinarse con el tool calling de Raon-1 mini, la decodificación especulativa rebaja el coste por paso en bucles de razonamiento de varios turnos, donde la latencia acumulada es crítica.
- Atención al cliente en coreano: el modelo principal destaca en conversación coreana según la model card; el borrador permite servir esas interacciones con menor latencia en infraestructura con GPUs de gama alta.
- Generación de código en pipelines de CI/CD: integrado en vLLM, el par modelo-borrador acelera la generación de parches y revisiones automatizadas dentro de flujos con restricciones de tiempo.
- Búsqueda aumentada con razonamiento: para flujos tipo BrowseComp con múltiples llamadas al modelo, el borrador amortigua el coste de cada invocación adicional del modelo principal.
- Evaluación e investigación en decodificación especulativa: sirve como referencia reproducible para medir tasas de aceptación y ganancias de throughput en arquitecturas MoE híbridas con atención lineal.
- Despliegue con memoria ajustada: combinado con la variante NVFP4 del modelo principal, permite inferencia con contexto completo de 256K en 20 GiB de VRAM, y el borrador añade velocidad sin un coste de memoria significativo (1,4 GB de pesos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo borrador en la información disponible. La model card del modelo principal reporta las siguientes cifras, que corresponden a Raon-1 mini y no al draft model:

| Benchmark | Raon-1 mini |
|---|---|
| AIME 2026 | 96,7 |
| HMMT Feb 2026 | 87,1 |
| GPQA Diamond | 86,0 |
| MultiChallenge | 64,9 |
| BrowseComp Plus | 55,9 |

No se dispone de datos sobre la tasa de aceptación del borrador ni sobre la ganancia de throughput medida en tokens por segundo.

## Requisitos de hardware

- VRAM del borrador: los pesos ocupan aproximadamente 1,4 GB en safetensors; en BF16 la huella es de alrededor de 1,4 GB, y en FP8 o FP4 se reduce a la mitad o a un cuarto.
- VRAM total del sistema: debe sumarse a la del modelo principal Raon-1 mini (28,8B parámetros). Con la variante NVFP4 del modelo principal, la model card indica que cabe con contexto completo de 256K en 20 GiB de VRAM.
- GPU recomendadas: no especificadas para el borrador. Para el conjunto, el requisito de 20 GiB en NVFP4 apunta a GPUs como RTX 4090 (24 GB), L40S (48 GB), A100 (40/80 GB) o H100 (80 GB).
- GPU de consumo: el par completo es viable en una RTX 4090 de 24 GB solo con la variante NVFP4 y contexto completo; en cuantizaciones mayores se necesitan GPUs de 40 GB o más.
- Despliegue: vLLM es la opción soportada de forma explícita. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La ganancia depende de la tasa de aceptación del borrador, que no se ha publicado.

## Comparativa con modelos similares

No se dispone de información sobre otros draft models comparables en la documentación proporcionada. La model card del modelo principal cita como referencias a Qwen3.6 35B-A3B, Gemma 4 26B-A4B, Flint (40B-A2.5B) e Inkling 2 Mini, pero no se aportan sus cifras ni sus especificaciones completas, por lo que no es posible construir una comparativa rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Función |
|---|---|---|---|---|
| Raon-1-mini-dflash2 | 677,8M (borrador) | No disponible | Apache 2.0 | Decodificación especulativa para Raon-1 mini |
| Alternativas de draft model | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo no es autónomo: usarlo sin Raon-1 mini como verificador produce salidas sin garantía de calidad.
- Requiere vLLM; no hay soporte documentado para otros motores de inferencia.
- El repositorio aplica un formulario de acceso restringido (gated) pese a la licencia Apache 2.0, lo que añade un paso manual antes de la descarga.
- No se han publicado tasas de aceptación ni métricas de speedup, por lo que el beneficio real en producción debe medirse en el hardware objetivo.
- Los sesgos y el riesgo de alucinación del sistema final dependen del modelo principal; el borrador no corrige esos comportamientos, solo acelera la generación.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base Qwen3 subyacente del borrador no imponga condiciones adicionales.
- No se documentan limitaciones idiomáticas específicas del borrador; las del modelo principal (énfasis en coreano e inglés) se heredan en el sistema completo.

## Enlaces

- Repositorio del borrador: https://huggingface.co/KRAFTON/Raon-1-mini-dflash2
- Modelo principal: https://huggingface.co/KRAFTON/Raon-1-mini
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización en Hugging Face: https://huggingface.co/KRAFTON
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
