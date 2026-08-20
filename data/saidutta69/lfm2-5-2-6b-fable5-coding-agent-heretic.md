# saidutta69/lfm2.5-2.6b-fable5-coding-agent-heretic

## Resumen

El modelo `saidutta69/lfm2.5-2.6b-fable5-coding-agent-heretic` es una variante "decensurada" (sin rechazos) del modelo `AyoubChLin/lfm2.5-2.6b-fable5-coding-agent`, que a su vez es un fine-tuning de parámetros completos (SFT) sobre el modelo `LiquidAI/LFM2.5-2.6B` de Liquid AI, entrenado con el dataset `saidutta69/fable-5-premium`. La variante heretic se produce mediante ablación direccional ("abliteration") con la herramienta Heretic v1.4.0, que edita los pesos responsables del comportamiento de rechazo en las capas de atención y MLP, en lugar de recurrir a un re-entrenamiento. Esto preserva las capacidades de agente de código, tool-calling y conversación multi-turno del modelo base.

Con 2.697.198.592 parámetros (~2,6B), el modelo hereda la arquitectura híbrida conv+attention de LFM2, con una ventana de contexto de 128K tokens y soporte nativo de llamada a herramientas. Los resultados de la ablación indican una divergencia KL de 0,014 respecto al modelo base y una reducción de rechazos de 96/100 a 7/100. Se publica en formato safetensors (BF16) y GGUF cuantizado (Q4_K_M, Q5_K_M, Q6_K, Q8_0), con un tamaño de repositorio de 14,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida conv+attention (LFM2) |
| Parametros totales | 2.697.198.592 (~2,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles |
| Licencia | LFM Open License v1.0 (other) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `LiquidAI/LFM2.5-2.6B`, un modelo denso de 2,6B parametros con arquitectura hibrida que combina capas convolucionales y de atencion, disenado especificamente para cargas de trabajo ageneticas con una ventana de contexto de 128K tokens. Sobre esta base, AyoubChLin realizo un fine-tuning de parametros completos con el dataset `fable-5-premium`, dando lugar al modelo `lfm2.5-2.6b-fable5-coding-agent`. Posteriormente, `saidutta69` aplico la ablacion direccional (abliteration) con Heretic v1.4.0, que identifica las direcciones de peso responsables de los rechazos y las edita en las salidas de atencion y las down-projections de MLP, sin recurrir a un proceso de fine-tuning adicional. Este metodo evita la degradacion de coherencia tipica de intentar "sobreescribir" comportamientos entrenados con RLHF, y mantiene intactas las capacidades de generacion de codigo, tool-calling y seguimiento de instrucciones del modelo base. La divergencia KL resultante de 0,014 confirma que la ablacion apenas altera el comportamiento general del modelo.

## Capacidades

- Generacion de codigo: mantiene las capacidades del modelo base LFM2.5-2.6B para generar funciones, scripts y fragmentos de codigo en Python y otros lenguajes.
- Tool calling nativo: soporta la generacion de llamadas a herramientas, lo que permite su integracion en pipelines ageneticos que requieran invocar APIs o funciones externas.
- Conversacion multi-turno: preserva el comportamiento de asistente conversacional del modelo base, con capacidad de mantener contexto a lo largo de 128K tokens.
- Razonamiento multi-paso: hereda la capacidad de planificar y ejecutar tareas ageneticas complejas, como secuencias de acciones con herramientas intermedias.
- Sin rechazos: la ablacion elimina los comportamientos de rechazo, por lo que el modelo responde a solicitudes que el modelo base rechazaria, incluidas aquellas que podrian ser daninas.
- Multilingue limitado: declarado unicamente en ingles, aunque el modelo base podria presentar capacidades residuales en otros idiomas.

## Casos de uso

- **Agente de codigo en entornos de desarrollo**: puede integrarse en IDEs o plugins para generar y completar codigo, aprovechando su ventana de 128K tokens para procesar repositorios completos o archivos extensos.
- **Asistente de tool-calling en produccion**: su soporte nativo de llamadas a herramientas lo hace apto para pipelines CI/CD que necesiten ejecutar comandos, consultar APIs o interactuar con sistemas externos de forma autonoma.
- **Despliegue on-device en laptops y dispositivos de borde**: con una cuantizacion Q4_K_M de ~1,5 GB y un throughput estimado de 220 tok/s, es viable en entornos sin GPU dedicada o con GPU de consumo.
- **Automatizacion de tareas multi-paso**: puede planificar y ejecutar secuencias de acciones con herramientas, como la gestion de tickets, la actualizacion de dependencias o la generacion de informes.
- **Generacion de documentacion tecnica**: el modelo puede redactar README, comentarios de codigo y documentacion de APIs, aprovechando su contexto largo para mantener coherencia en documentos extensos.
- **Investigacion de seguridad y analisis de vulnerabilidades**: al no tener capas de rechazo, puede utilizarse para explorar escenarios de ataque, generar payloads o analizar codigo malicioso en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos cuantitativos proporcionados corresponden a la evaluacion del proceso de ablacion:

| Metrica | Valor |
|---|---|
| Divergencia KL (respecto al base) | 0,014 |
| Rechazos en 100 prompts (antes) | 96 |
| Rechazos en 100 prompts (despues) | 7 |

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,5 GB con GGUF Q4_K_M, ~1,7 GB con Q5_K_M, ~1,9 GB con Q6_K, ~2,5 GB con Q8_0 y ~5,4 GB con BF16 safetensors (sin contar overhead del runtime).
- GPU recomendadas: cualquier GPU con 4 GB de VRAM o superior (por ejemplo, RTX 3050, RTX 4060, GTX 1660 Super) para las cuantizaciones GGUF; para el BF16 se recomienda al menos 8 GB (RTX 3070, RTX 4070, A10).
- En GPU de consumo: si, la cuantizacion Q4_K_M cabe incluso en tarjetas de 4 GB y en iGPU modernas con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (con `llama serve`), Ollama, LM Studio, Transformers con HuggingFace, y compatible con endpoints TGI (tag `endpoints_compatible`).
- Latencia y throughput: el blog de Liquid AI indica 220 tok/s para LFM2.5-2.6B en menos de 2,5 GB; este modelo heretico deberia presentar un rendimiento similar al ser la misma arquitectura base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| saidutta69/lfm2.5-2.6b-fable5-coding-agent-heretic | 2,6B | 128K | LFM Open v1.0 | Variante sin rechazos del modelo base |
| AyoubChLin/lfm2.5-2.6b-fable5-coding-agent | 2,6B | 128K | LFM Open v1.0 | Modelo base con rechazos, SFT sobre fable5-premium |
| LiquidAI/LFM2.5-2.6B | 2,6B | 128K | LFM Open v1.0 | Modelo original de Liquid AI, agenetico on-device |

No se dispone de datos comparativos con otros modelos de la misma categoria (por ejemplo, Qwen2.5-Coder-3B o Codestral-3B) en la informacion proporcionada.

## Limitaciones y advertencias

- **Sin capas de seguridad**: la ablacion elimina deliberadamente los rechazos, por lo que el modelo puede generar contenido inapropiado, danino o no seguro. No existe filtrado de seguridad adicional.
- **Riesgo de alucinacion**: al ser un modelo de 2,6B, es propenso a generar respuestas factualmente incorrectas o inventadas, especialmente en tareas complejas.
- **Solo ingles**: la informacion declarada indica soporte exclusivo del idioma ingles, con capacidades residuales limitadas en otros idiomas.
- **Restricciones de licencia**: la LFM Open License v1.0 puede imponer condiciones para uso comercial o derivados; se recomienda revisar los terminos en el repositorio de Liquid AI antes de desplegar en produccion.
- **Ablacion no es una mejora de capacidades**: el autor indica explicitamente que este modelo no es una mejora sobre el base; es la misma capacidad con los rechazos eliminados. La divergencia KL es baja (0,014), pero puede haber degradaciones sutiles en casos limites.
- **Responsabilidad del despliegue**: el autor advierte que el usuario es responsable de como se despliega el modelo, dado que no hay ningun filtro de seguridad interpuesto.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/saidutta69/lfm2.5-2.6b-fable5-coding-agent-heretic
- Modelo base (AyoubChLin): https://huggingface.co/AyoubChLin/lfm2.5-2.6b-fable5-coding-agent
- Modelo original (LiquidAI): https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- Blog de abliteration (mlabonne): https://huggingface.co/blog/mlabonne/abliteration
- Documentacion de LFM2.5-2.6B: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
