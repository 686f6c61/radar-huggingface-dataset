# harness-hub/LFM3-1.7B-opencode-GGUF

## Resumen

LFM3-1.7B-opencode-GGUF es la conversión a formato GGUF del adaptador LoRA `harness-hub/LFM3-1.7B-opencode`, un ajuste fino por refuerzo (RL) del modelo base LiquidAI/LFM3-1.7B entrenado dentro del agente de programación OpenCode. El adaptador está pensado para su uso con llama.cpp y mejora al modelo base en tareas de agente: según la model card, resuelve 15,3 puntos porcentuales más de tareas y realiza un 43 % menos de llamadas a herramientas en las tareas que ambos resuelven. Lo publica el usuario `harness-hub` bajo la licencia LFM1.0 del modelo original.

El artefacto distribuido es únicamente el adaptador en precisión F16 (`LFM3-1.7B-harbor-opencode-lora-F16.gguf`), no un modelo completo: debe cargarse sobre un GGUF del modelo base LiquidAI/LFM3-1.7B, preferiblemente en Q8_0, para acercarse al comportamiento con el que se entrenó (BF16). El repo ocupa 0,1 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha, lo que lo convierte en una publicación muy reciente y de nicho.

Su relevancia es acotada pero concreta: demuestra que un modelo pequeño de 1,7B parámetros puede especializarse mediante RL en un agente de código concreto (OpenCode) y desplegarse localmente con llama.cpp en hardware modesto, manteniendo una ventana de contexto de 65.536 tokens configurable en el servidor de ejemplo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; el artefacto es un adaptador LoRA) |
| Parámetros totales | 32.937.472 (dato del repo en safetensors; corresponde al adaptador, no al modelo completo) |
| Parámetros activos | no disponible |
| Longitud de contexto | 65.536 tokens (valor usado en el comando de ejemplo con `-c 65536`) |
| Tipos de cuantización | adaptador en F16; base recomendada Q8_0 (compatible con cualquier GGUF del base en llama.cpp) |
| Idiomas soportados | no disponible |
| Licencia | LFM1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | GGUF (adaptador LoRA F16 para llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es LiquidAI/LFM3-1.7B, del que no se detalla arquitectura en la información disponible. Sobre él se aplica un adaptador LoRA entrenado con aprendizaje por refuerzo dentro del agente de programación OpenCode, según indica la model card. No se especifican el número de tokens de entrenamiento, la composición del dataset ni los detalles del algoritmo de RL empleado; esa información se remite a la card del adaptador original (`harness-hub/LFM3-1.7B-opencode`).

La conversión a GGUF se realizó con `convert_lora_to_gguf.py` de llama.cpp a partir del adaptador PEFT, con `--outtype f16` y pasando el directorio de configuración del modelo base. El adaptador se entrenó sobre los pesos BF16, por lo que la card recomienda usar un base lo más cercano posible a esa precisión; Q8_0 se presenta como valor por defecto razonable. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras).

## Capacidades

- Generación de texto y razonamiento orientados a tareas de agente de programación.
- Uso de herramientas (tool calling / function calling) dentro del bucle del agente OpenCode, con una reducción del 43 % en llamadas a herramientas en las tareas que el modelo base también resuelve.
- Ejecución de tareas multi-paso sobre un repositorio o conjunto de archivos (por ejemplo, consultas sobre CSV y análisis de datos).
- Integración con clientes compatibles con la API OpenAI mediante el servidor `llama serve` y el proveedor `@ai-sdk/openai-compatible`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistente de código local en terminal: desplegando el adaptador con `llama serve` y apuntando OpenCode a `http://localhost:8080/v1`, se obtiene un agente de programación que funciona sin conexión a servicios en la nube, adecuado para entornos con requisitos de privacidad.
- Análisis de datos ad hoc sobre ficheros: la card muestra el ejemplo de preguntar «Which region had the highest revenue growth in sales.csv?», un caso típico de agente que inspecciona un CSV y responde con llamadas a herramientas.
- Automatización de tareas repetitivas de repositorio: al reducir un 43 % las llamadas a herramientas en tareas ya resueltas por el base, disminuye el coste y la latencia en bucles de agente sobre CI o scripts de mantenimiento.
- Prototipado de agentes en hardware de consumo: al ser un adaptador sobre un modelo de 1,7B en GGUF, puede ejecutarse en equipos sin GPU de datacenter, lo que facilita experimentar con flujos de agente antes de escalar a modelos mayores.
- Evaluación comparativa de técnicas de RL para agentes: sirve como referencia reproducible para medir cuánto mejora un modelo pequeño al entrenarse dentro de un agente concreto frente a su versión base.
- Despliegue de un servidor compatible con OpenAI para herramientas internas: el alias `lfm3-harbor-opencode` y la API en `/v1` permiten conectarlo a clientes existentes que hablen el protocolo de OpenAI sin cambios de código.

## Benchmarks y rendimiento

La model card solo aporta dos cifras relativas, sin tabla de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Métrica | Resultado |
|---|---|
| Tareas resueltas frente al modelo base | +15,3 puntos porcentuales |
| Llamadas a herramientas en tareas resueltas por ambos | −43 % |

Advertencia de la propia card: estas puntuaciones provienen de la evaluación del adaptador original con vLLM en BF16; el fichero GGUF no se ha reevaluado con llama.cpp, y una base cuantizada alejará aún más los resultados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un modelo base de 1,7B en GGUF, el adaptador añade una sobrecarga mínima (repo de 0,1 GB).
- GPU recomendadas: no disponibles; el flujo documentado usa `llama serve` con llama.cpp, que permite ejecución en CPU.
- GPU de consumo: previsiblemente viable en tarjetas de consumo por el tamaño del modelo base, aunque la información proporcionada no confirma modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: llama.cpp (`llama serve` con `--lora`), cliente OpenCode 1.19.5 y cualquier cliente compatible con la API OpenAI apuntando a `/v1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables en la misma categoría (adaptadores LoRA para agentes de código sobre modelos de ~1,7B).

## Limitaciones y advertencias

- No reevaluado en GGUF: las métricas de la card proceden de vLLM en BF16; el rendimiento real con llama.cpp y una base cuantizada puede diferir.
- Es un adaptador, no un modelo completo: requiere descargar por separado un GGUF del base LiquidAI/LFM3-1.7B y cargarlo con `--lora`.
- Licencia LFM1.0: es necesario revisar sus términos antes de cualquier uso comercial, ya que la card la marca como `other`.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe.
- Sesgos y riesgo de alucinación: no documentados en la información disponible; como en cualquier modelo de 1,7B, la fiabilidad en tareas complejas es limitada y conviene validar las salidas.
- Especialización estrecha: el entrenamiento se realizó dentro de OpenCode, por lo que su ventaja puede no transferirse a otros frameworks de agente.
- Repo sin descargas ni valoraciones: no hay evidencia de uso en producción ni informes independientes.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/harness-hub/LFM3-1.7B-opencode-GGUF
- Adaptador original: https://huggingface.co/harness-hub/LFM3-1.7B-opencode
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- OpenCode: https://github.com/sst/opencode
- llama.cpp: https://github.com/ggml-org/llama.cpp
