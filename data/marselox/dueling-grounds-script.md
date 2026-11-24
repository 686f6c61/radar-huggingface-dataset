# Marselox/dueling-grounds-script

## Resumen

El repositorio `Marselox/dueling-grounds-script` no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en Hugging Face cuyo contenido es un ejecutable portable para Windows 10/11 de 64 bits, distribuido como archivo ZIP (`dueling-grounds-script-v1.2.0-win64.zip`, 8,9 MB) y protegido con la contraseña `2026`. La model card se presenta como una página de descarga de una herramienta de asistencia para videojuegos (denominada "script" o "cheat") orientada al juego Dueling Grounds, con módulos de radar 2D, filtrado de objetos por rareza, perfiles JSON intercambiables en caliente y una capa de renderizado diseñada para evadir la captura de pantalla de OBS, ShadowPlay y Discord.

Desde la perspectiva de un catálogo de modelos de IA, el artefacto carece de cualquier componente de aprendizaje automático: no hay pesos, no hay tokenizador, no hay arquitectura de red neuronal, no hay pipeline declarado y no existe información sobre entrenamiento, datos o evaluación. Los tags de Hugging Face (`windows`, `x64`, `portable`, `dueling-grounds-script`) confirman que se trata de un binario empaquetado, no de un modelo. Las descargas y los "likes" registrados son cero, y el repositorio se creó y actualizó en la misma marca temporal (24 de noviembre de 2026), lo que sugiere una publicación automatizada o de un solo paso.

La relevancia de esta ficha es, por tanto, fundamentalmente negativa: sirve para documentar que el identificador no corresponde a un modelo y para advertir de los riesgos asociados a la ejecución de binarios de procedencia desconocida que solicitan privilegios de administrador y promueven la desactivación de alertas de seguridad del sistema operativo. Cualquier evaluador que llegue a este repositorio buscando un modelo de lenguaje, visión o audio debe descartarlo de inmediato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica; no es un modelo de IA (binario ejecutable portable para Windows x64) |
| Parametros totales | No disponible (no existen pesos de modelo) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | No disponible; el artefacto distribuido es un ZIP con un `.exe` (`dueling-grounds-script-v1.2.0-win64.exe`, build `v1.7.9` / `63F40D`) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El contenido descrito en la model card es una aplicación nativa para Windows que, según el propio autor, opera en modo usuario ("user-mode external core") sin inyección de DLL en el proceso objetivo, emplea un escáner dinámico de offsets con resolución automática de firmas de punteros tras los parches del juego, y utiliza Desktop Duplication para el renderizado. Se mencionan siete hilos de trabajo, sondeo a 168 Hz para el escáner y a 400 Hz para la capa de renderizado, y una tecla de pánico (`END`) para liberar handles y terminar el proceso.

No hay datos sobre tokens de entrenamiento, composición de dataset, RLHF, DPO ni ninguna innovación en el ámbito del aprendizaje automático. La única "innovación" declarada es de ingeniería de software orientada a la evasión de detección: exclusión de capturas de pantalla en herramientas de streaming y liberación instantánea de recursos. Esta ficha no valida ninguna de esas afirmaciones, que proceden exclusivamente del texto promocional del autor.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni audio: no es un modelo de IA.
- No soporta tool calling ni function calling en el sentido de un LLM; el "script" interactúa con un proceso de juego mediante lectura de memoria y renderizado superpuesto.
- No soporta agentes ni razonamiento multi-paso.
- El multilingüismo declarado en los metadatos (14 idiomas) se refiere, en todo caso, al idioma de la documentación o de la interfaz del binario, no a capacidades lingüísticas de un modelo.
- Funcionalidades declaradas por el autor (no verificadas): radar 2D, filtro de loot por rareza, seguimiento de contenedores, perfiles JSON con cambio en caliente, capa de renderizado "stream-proof" y tecla de pánico.

## Casos de uso

- Ninguno en el ámbito del desarrollo de software con IA, la investigación o el despliegue de modelos: el artefacto no es un modelo y no puede integrarse en pipelines de inferencia, RAG, agentes ni evaluación de benchmarks.
- Auditoría de seguridad: un analista puede utilizar el repositorio como caso de estudio de publicación maliciosa o engañosa en Hugging Face, revisando metadatos, model card y patrón de distribución (ZIP con contraseña, enlace a GitHub de terceros, instrucciones para desactivar SmartScreen).
- Formación en higiene de cadena de suministro: sirve como ejemplo de por qué conviene verificar la identidad del autor, la presencia de pesos reales y la coherencia entre tags y contenido antes de ejecutar cualquier binario.
- Documentación de taxonomías: útil para equipos que mantengan un catálogo interno y necesiten clasificar artefactos que no son modelos y excluirlos de los índices de evaluación.
- Investigación de técnicas de evasión: el texto describe mecanismos de exclusión de captura de pantalla y escáneres de offsets que pueden interesar a equipos de análisis de software, siempre en un entorno aislado y con fines defensivos.
- Concienciación de usuarios finales: la ficha puede emplearse para advertir de que descargar y ejecutar como administrador un binario de origen desconocido con contraseña en el archivo constituye un riesgo elevado de compromiso del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, y las cifras que aparecen en la model card (168 Hz, 400 Hz, 96,8 % de consistencia) son afirmaciones del autor sobre el comportamiento del binario, no métricas de un modelo evaluado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados del binario: Windows 10/11 de 64 bits, procesadores Intel o AMD x64, archivo de 8,9 MB y ejecución como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto no es compatible con servidores de inferencia.
- Latencia y throughput: no disponibles como métricas de modelo; las cifras de sondeo del autor no son verificables ni comparables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA. Frente a un modelo de lenguaje de cualquier tamaño, la comparación relevante es que este repositorio carece de pesos, contexto, licencia de uso de modelo y benchmarks, por lo que no puede situarse en ninguna tabla de evaluación de LLM.

## Limitaciones y advertencias

- No es un modelo de IA: no debe incluirse en catálogos, rankings ni pipelines de evaluación de modelos.
- La model card incluye instrucciones para desactivar o evitar alertas de Windows Defender y SmartScreen, lo que constituye una señal de riesgo de seguridad.
- El binario se distribuye comprimido con contraseña (`2026`) y se solicita ejecutarlo como administrador, una combinación habitual en campañas de distribución de software malicioso.
- El enlace de descarga apunta a un repositorio de GitHub de un tercero (`FlorianBrooks721/dueling-grounds-script`) distinto del autor del repositorio de Hugging Face, lo que dificulta la trazabilidad.
- La licencia MIT declarada se refiere al paquete publicado, no a garantías de seguridad ni a la legalidad del uso del software en el contexto de un videojuego; el uso de este tipo de herramientas puede infringir los términos de servicio del juego.
- Cero descargas y cero "likes" en el momento de la consulta: no existe validación comunitaria ni evidencia de uso legítimo.
- No hay información sobre sesgos, alucinación o limitaciones de contexto porque no hay modelo; cualquier expectativa en ese sentido es inaplicable.
- El repositorio se creó y actualizó en la misma marca temporal, lo que sugiere publicación automatizada sin revisión.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Marselox/dueling-grounds-script
- Repositorio de GitHub referenciado en la model card: https://github.com/FlorianBrooks721/dueling-grounds-script
- Descarga directa citada por el autor (no recomendada): https://github.com/FlorianBrooks721/dueling-grounds-script/releases/latest/download/dueling-grounds-script-v1.2.0-win64.zip
