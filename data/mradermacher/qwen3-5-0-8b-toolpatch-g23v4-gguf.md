# mradermacher/Qwen3.5-0.8B-toolpatch-g23v4-GGUF

## Resumen

Qwen3.5-0.8B-toolpatch-g23v4-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo scasella91/Qwen3.5-0.8B-toolpatch-g23v4, un modelo derivado de la familia Qwen3.5 con 772.845.888 parametros totales (aproximadamente 0,77 mil millones). El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones GGUF, y se distribuye bajo licencia Apache 2.0.

El modelo base combina dos caracteristicas que lo hacen atipico: por un lado, es un "toolpatch", es decir, un ajuste orientado a mejorar el uso de herramientas (tool calling) sobre el modelo original; por otro, incorpora tecnicas de edicion de pesos (weight editing) y se enmarca en el ambito de la interpretabilidad mecanicista (mechanistic interpretability). El resultado es un modelo pequeno, de menos de mil millones de parametros, pensado para experimentacion en entornos con recursos limitados y para investigacion sobre como se comporta el tool calling a nivel interno.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar el modelo en hardware de consumo gracias a las cuantizaciones GGUF, que van desde 0,5 GB (Q2_K) hasta 1,7 GB (f16). Al tratarse de un modelo de 0,8B, es adecuado para pruebas de concepto, prototipado rapido y estudios de interpretabilidad, no para cargas de produccion de alta exigencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag `qwen3_5`); no se detalla variante exacta |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tambien `transformers` como libreria declarada; el repo base usa safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del tag `qwen3_5`, que situa el modelo en la familia Qwen3.5. Con 772.845.888 parametros, se trata de un transformer denso de pequeno tamano. El tag `mlx` sugiere que el modelo base puede haberse preparado o probado tambien para el framework MLX de Apple, aunque no se especifica el alcance de ese soporte.

El aspecto diferencial es el sufijo "toolpatch": el modelo base scasella91/Qwen3.5-0.8B-toolpatch-g23v4 ha sido sometido a edicion de pesos (weight editing) orientada a mejorar el comportamiento de tool calling, dentro de un trabajo de interpretabilidad mecanicista. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. Esta ficha se limita, por tanto, a lo declarado en la model card y en los metadatos de Hugging Face.

## Capacidades

- Generacion de texto conversacional en ingles (tag `conversational`).
- Tool calling / function calling, reforzado mediante edicion de pesos sobre el modelo base.
- Orientado a investigacion en interpretabilidad mecanicista (analisis de activaciones y pesos).
- Compatible con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras tipo TGI o servidores compatibles con la API de OpenAI.
- Soporte multimodal declarado mediante los ficheros `mmproj` (multi-modal supplement), aunque no se detalla que modalidades cubre.
- Capacidades de razonamiento, codigo o matematicas: no documentadas de forma especifica en la informacion disponible.

## Casos de uso

- Prototipado de agentes con tool calling: el modelo puede integrarse en un bucle de agente que invoque funciones externas (APIs, calculadoras, busquedas) y validar el flujo completo antes de migrar a un modelo mayor. Su tamano de 0,8B permite iterar rapidamente en local.
- Investigacion en interpretabilidad mecanicista: al ser un modelo con edicion de pesos documentada, sirve para estudiar que circuitos internos se modifican al inyectar capacidad de tool calling, comparando activaciones con el modelo base sin parchear.
- Pruebas de regresion de pipelines de function calling: se puede usar como "modelo de referencia" ligero en CI/CD para verificar que el esquema de herramientas y el parseo de argumentos funcionan antes de desplegar modelos mayores.
- Despliegue en dispositivos con recursos muy limitados: con cuantizaciones de 0,5-0,9 GB, cabe en Raspberry Pi, portatiles antiguos o contenedores con poca RAM, permitiendo demos offline de asistentes con herramientas.
- Educacion y divulgacion: su tamano y su licencia Apache 2.0 lo hacen idoneo para talleres donde se ensena a cuantizar, cargar y ejecutar modelos GGUF con llama.cpp u Ollama.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 14 variantes, lo que permite medir la degradacion de calidad (perplejidad, tasa de acierto en tool calling) entre Q2_K y f16 en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,9 GB para cuantizaciones Q2_K a Q8_0; 1,7 GB para f16. Los ficheros `mmproj` anaden 0,2-0,3 GB si se usa la parte multimodal.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060, etc.). Tambien funciona en CPU.
- Cabe en GPU consumer: si, practicamente en todas las GPU discretas modernas e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con endpoints (TGI, vLLM con soporte GGUF), y el stack MLX en Apple Silicon.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera alta velocidad en hardware consumer, pero no se aportan cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-toolpatch-g23v4 (este) | 772.845.888 | no disponible | Apache 2.0 | GGUF, safetensors | Tool calling via edicion de pesos; solo ingles |
| Qwen2.5-0.5B / 1.5B (referencia de familia) | 0,5B / 1,5B | no disponible en esta ficha | Apache 2.0 | GGUF, safetensors | Modelos base de la familia; sin parche de herramientas |
| Modelos pequenos de tool calling de otros autores | no disponible | no disponible | variable | GGUF | No se dispone de datos verificables para comparar rendimiento |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Solo soporta ingles segun los metadatos (`language: en`); no se garantiza un rendimiento correcto en castellano u otros idiomas.
- Al ser un modelo de 0,8B, la tasa de alucinacion y los errores de razonamiento son previsiblemente altos en tareas complejas; no se recomienda para produccion critica sin validacion humana.
- La edicion de pesos puede introducir comportamientos no documentados o sesgos no evaluados; no se han publicado evaluaciones de seguridad o sesgo.
- La longitud de contexto no esta documentada, lo que impide planificar conversaciones largas o documentos extensos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que carece de validacion comunitaria.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar la licencia y condiciones del modelo base original de Qwen y del trabajo de edicion de pesos antes de un despliegue comercial.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la fiabilidad del tool calling; para uso real se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-0.8B-toolpatch-g23v4-GGUF
- Modelo base: https://huggingface.co/scasella91/Qwen3.5-0.8B-toolpatch-g23v4
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Qwen3.5-0.8B-toolpatch-g23v4-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
