# Lamancio/RoHe-Coder-Q4_K_M

## Resumen

RoHe-Coder-Q4_K_M es la cuantización GGUF en Q4_K_M de un modelo de 3.402.836.480 parámetros (unos 3,4 B) publicado por el usuario Lamancio. La model card lo titula «Granite-Claude-Fable-3B-MQL5-Quant» y declara como base `google/granite-3.0-3b-a800m-instruct`, aunque el propio autor deja abierta la posibilidad de que el modelo base exacto sea otro. Se trata de un ajuste fino con LoRA (mediante Unsloth) orientado a un nicho muy concreto: la generación de código MQL5 nativo para MetaTrader 5 y su integración con modelos de machine learning (XGBoost, CatBoost, Random Forest) dentro de Expert Advisors.

El problema que aborda es real y específico: los modelos generalistas confunden MQL5 con MQL4 o con C++ puro, y producen híbridos que no compilan (por ejemplo, llamadas a `OrderSend` o `OrderSelect` en lugar de la librería `<Trade/Trade.mqh>`). El ajuste se apoya en documentación oficial de MQL5 con énfasis en programación orientada a objetos y en plantillas cuantitativas de alta complejidad.

Su relevancia es de nicho: no compite en benchmarks generales, sino que aspira a ser una herramienta local y ligera (repo de 2,1 GB) para desarrolladores de trading algorítmico que trabajan dentro del ecosistema MetaTrader. No hay métricas publicadas, ni datos de contexto, ni listado de idiomas, y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base declarado (`google/granite-3.0-3b-a800m-instruct`); no detallada en la model card |
| Parámetros totales | 3.402.836.480 (~3,4 B) |
| Parámetros activos | ~800 M según la denominación del modelo base declarado (`a800m`); no confirmado en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 2,1 GB); no se publican safetensors en este repositorio |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo final. El único dato estructural es el modelo base declarado, `google/granite-3.0-3b-a800m-instruct`, cuya nomenclatura sugiere un transformer decoder-only con mezcla de expertos (MoE) y unos 800 M de parámetros activos, si bien el autor anota explícitamente «Ajuste se o modelo base exato for ligeiramente diferente», es decir, no garantiza que el base sea exactamente ese. El número de parámetros reportado en los metadatos (3,4 B) es coherente con un modelo de ese orden de magnitud.

El entrenamiento se realizó con LoRA sobre el framework Unsloth. El conjunto de datos, según la card, combina documentación oficial de MQL5 (con foco en los capítulos de orientación a objetos), código fuente MQL5 de alta complejidad y scripts de Python orientados a pipelines cuantitativos (XGBoost/CatBoost). No se especifican el número de tokens, la composición exacta del dataset, la proporción de cada fuente ni si hubo fases de RLHF o DPO; el autor se limita a indicar que el entrenamiento convergió «con normas de gradiente estables y pérdida de validación equilibrada», sin cifras. No se documenta ninguna innovación técnica en decodificación, atención o inferencia: el valor diferencial es exclusivamente la especialización del dominio.

## Capacidades

- Generación de código MQL5 nativo, con uso de la librería estándar y de `<Trade/Trade.mqh>` en lugar de las funciones heredadas de MQL4.
- Programación orientada a objetos en MQL5: clases, herencia y componentes de la Standard Library.
- Estructuración de Expert Advisors completos (declaración de propiedades, manejadores `OnInit`, `OnTick`, `OnDeinit`).
- Integración de modelos de ML en el terminal: consumo de predicciones de XGBoost/CatBoost vía fichero o vía DLL.
- Generación de código auxiliar en Python para el pipeline de datos que alimenta al EA.
- Conversación multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad declarada con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no disponibles; la card está en inglés y el ejemplo de prompt en portugués, pero no se declara cobertura de idiomas.

## Casos de uso

- Generación de Expert Advisors desde cero: el modelo produce esqueletos de EA en MQL5 con sintaxis nativa y estructura OOP, lo que reduce el ciclo de iteración frente a un modelo generalista que devuelve código no compilable.
- Migración de código MQL4 a MQL5: reescritura de llamadas obsoletas (`OrderSend`, `OrderSelect`) hacia la clase `CTrade` y el resto de la librería estándar moderna.
- Puente Python-MQL5 para inferencia de modelos tabulares: generación del código del EA que lee predicciones de XGBoost desde fichero o DLL, junto con el script de Python que las exporta.
- Asistente de código en el IDE: integrado localmente en LM Studio u Ollama y conectado a un plugin tipo Continue, sirve para autocompletar y explicar fragmentos de MQL5 sin enviar código propietario a la nube.
- Auditoría de bases de código existentes: detección de construcciones MQL4 residuales y de patrones no portables dentro de una carpeta de indicadores y EAs.
- Prototipado de estrategias cuantitativas fuera del terminal: uso del modelo como asistente para escribir el research en Python (features, entrenamiento del modelo, validación) antes de trasladar la lógica a MQL5.
- Material formativo: generación de ejemplos comentados de clases MQL5 y de patrones de integración con librerías externas para documentación interna de un equipo.
- Revisión de código en CI: pre-revisión automática de pull requests con código MQL5, marcando usos de APIs obsoletas o firmas de función incorrectas antes de la compilación en MetaEditor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay cifras de MMLU, HumanEval, GSM8K ni de ningún benchmark específico de MQL5, ni una evaluación con tamaño de muestra y metodología reproducibles.

La model card incluye únicamente una comparación cualitativa basada en un único prompt («escribir la estructura de un EA en MQL5 que importa y consume predicciones de un modelo XGBoost»), en la que el autor afirma que los modelos base producen código híbrido MQL4/MQL5 que no compila y que este ajuste devuelve MQL5 nativo con OOP y bindings correctos. Es una demostración anecdótica, no un benchmark: no se especifica el modelo base concreto evaluado, ni la temperatura, ni el número de muestras, ni un criterio de compilación automatizado.

| Evaluación | Resultado reportado |
|---|---|
| Benchmarks estándar (MMLU, HumanEval, GSM8K) | no disponible |
| Benchmark específico de MQL5 | no disponible |
| Prueba cualitativa del autor (1 prompt) | MQL5 nativo con OOP y bindings, frente a código híbrido MQL4/MQL5 del base |
| Tasa de compilación en MetaEditor | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2,1 GB solo para los pesos en Q4_K_M; con caché KV y contexto moderado, un presupuesto realista de 3 a 4 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más (GTX 1660, RTX 3060, RTX 4060, RTX 4090); también cabe en GPUs de 4 GB con contexto reducido.
- Cabe en GPU de consumo: sí, con holgura; es uno de los puntos que el autor destaca («runs extremely fast locally on consumer hardware»).
- CPU: viable en inferencia solo-CPU con llama.cpp, dado el tamaño del modelo.
- Opciones de despliegue: LM Studio y Ollama son las vías que documenta el autor; llama.cpp es la opción directa sobre el GGUF. vLLM y TGI no son el objetivo natural de un GGUF Q4_K_M.
- Latencia y throughput estimados: no disponibles. El autor afirma velocidad alta en local, pero no publica tokens por segundo, hardware de referencia ni tamaño de lote.
- Almacenamiento: 2,1 GB para el repositorio; el fichero GGUF individual será algo menor.

## Comparativa con modelos similares

Los datos de los modelos comparativos provienen de su documentación pública y no de la información proporcionada en esta ficha; conviene verificarlos antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoHe-Coder-Q4_K_M (esta ficha) | 3,4 B totales (~800 M activos, no confirmado) | no disponible | MQL5 + ML para MetaTrader 5 | Apache 2.0 | GGUF Q4_K_M, repo de 2,1 GB, 0 descargas |
| google/granite-3.0-3b-a800m-instruct (base declarado) | 3,4 B totales / 800 M activos | no disponible en esta ficha | Propósito general, instruction-tuned | Apache 2.0 | Pesos originales en HuggingFace |
| Qwen2.5-Coder-3B-Instruct | ~3,1 B | 32 768 tokens nativos | Código generalista multilingüe | Apache 2.0 | Amplia difusión, múltiples cuantizaciones |
| Llama-3.2-3B-Instruct | ~3,2 B | 128 000 tokens | Propósito general, instruction-tuned | Licencia comunitaria Llama 3.2 | Amplia difusión, múltiples cuantizaciones |

La diferencia clave no es de tamaño ni de contexto, sino de especialización: frente a los modelos generalistas de 3 B, este ajuste prioriza la corrección sintáctica en MQL5 y la integración con modelos tabulares, a costa de un dominio mucho más estrecho y de una validación comunitaria inexistente. El base declarado es la referencia directa para medir la mejora, pero no se han publicado cifras que la cuantifiquen.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el repositorio se llama «RoHe-Coder-Q4_K_M» mientras que la model card se titula «Granite-Claude-Fable-3B-MQL5-Quant». No hay explicación de la relación entre ambos nombres.
- Modelo base no confirmado: el propio autor escribe «Ajuste se o modelo base exato for ligeiramente diferente». Cualquier afirmación sobre arquitectura, contexto o parámetros activos es una inferencia, no un dato verificado.
- Sin benchmarks: no hay métricas de calidad de código, tasa de compilación ni evaluación humana. La única evidencia es un ejemplo cualitativo de un solo prompt.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento del registro; no hay informes de terceros sobre su comportamiento real.
- Riesgo de alucinación en APIs poco documentadas: el ajuste se entrenó sobre un subconjunto de la documentación de MQL5, por lo que funciones de nicho, firmas de clases recientes o comportamientos del terminal pueden generarse de forma plausible pero incorrecta.
- El ejemplo de código de la propia model card merece revisión antes de reutilizarse: incluye construcciones discutibles (una directiva `#include` apuntando a una DLL, una lectura de fichero sin apertura previa y una llamada a `trade.SendOrder` con una firma poco habitual). Conviene compilarlo en MetaEditor antes de asumir que representa la salida típica del modelo.
- Contexto e idiomas no documentados: no se puede garantizar el comportamiento en conversaciones largas ni en castellano.
- Degradación esperada fuera de dominio: un ajuste tan específico suele mermar capacidades generales de razonamiento y de programación en otros lenguajes.
- Licencia: el repositorio declara Apache 2.0, lo que permite uso comercial, pero debe verificarse también la licencia del modelo base declarado y el origen de los datos de entrenamiento (código y documentación de MQL5), cuya redistribución no se detalla.
- Sesgos: no documentados. No hay información sobre la diversidad del dataset ni sobre filtros aplicados.
- Fecha de creación atípica (2026-10-20) en los metadatos: conviene contrastarla con el estado real del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Lamancio/RoHe-Coder-Q4_K_M
- Modelo base declarado: https://huggingface.co/google/granite-3.0-3b-a800m-instruct (no confirmado por el autor)
- Unsloth (framework de ajuste citado): el enlace de la model card apunta genéricamente a https://github.com, sin URL específica del proyecto
- Paper, blog o demo del ajuste: no disponibles en la información proporcionada
