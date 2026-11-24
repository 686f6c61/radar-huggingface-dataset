# parth2907/steam-deck-cheat-trainer

## Resumen

`parth2907/steam-deck-cheat-trainer` es un repositorio alojado en Hugging Face que, pese a su ubicación en la plataforma, no contiene un modelo de inteligencia artificial. Se trata de un paquete de software ejecutable para Windows (x64) distribuido como archivo ZIP de 4,8 MB, cuya model card describe módulos de tipo "cheat trainer" orientados a juegos: radar 2D, filtro de loot, overlay externo, perfiles JSON intercambiables en caliente y una capa de renderizado diseñada para evadir la captura de pantalla en OBS, ShadowPlay y Discord.

El artefacto se presenta con etiquetas propias de las fichas de modelos (`license:mit`, códigos de idioma, `region:us`) y con un README estructurado como una model card, pero el contenido real es una guía de instalación de un binario (`fisch-script-auto-catch-macro-v1.2.2-win64.exe`) protegido con contraseña de archivo. No se declara arquitectura de red neuronal, número de parámetros, longitud de contexto, dataset de entrenamiento ni proceso de alineación.

La relevancia de esta ficha es, por tanto, documental y de advertencia: sirve para identificar un caso de uso indebido del formato de model card en Hugging Face, donde la apariencia de ficha técnica encubre la distribución de software de terceros potencialmente no deseado. No debe evaluarse como modelo de lenguaje ni integrarse en ningún pipeline de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El repositorio no contiene pesos neuronales, tokenizador, configuración de transformer, MoE, SSM ni ningún componente de aprendizaje automático. La model card enumera módulos funcionales de un programa de trampas para juegos: radar 2D con filtrado de objetos por rareza, tecla de pánico `END` con cierre de proceso "sin rastro", cambio de perfiles JSON en menos de 10 ms, overlay externo a 144 Hz con cajas delimitadoras y esqueletos de huesos, núcleo externo en modo usuario con renderizado por Desktop Duplication sin hooks DLL internos, y una capa de renderizado "stream-proof" que excluye la ventana de capturas de OBS, ShadowPlay y Discord.

Tampoco hay información sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO o innovaciones técnicas de inferencia (decodificación especulativa, atención lineal, etc.). Los únicos "datos técnicos" del README son cifras de rendimiento del ejecutable (polling a 247 Hz, respuesta en menos de 25 ms, consumo inferior a 44 MB de RAM), no métricas de un modelo.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de las APIs de modelos.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma son metadatos de la ficha, no competencias del artefacto.
- El binario declara funciones de manipulación de memoria de otros procesos, overlay gráfico y evasión de captura de pantalla.
- No dispone de modo "thinking", visión, audio ni ninguna capacidad cognitiva.

## Casos de uso

- Ninguno legítimo dentro del ámbito de la IA. El artefacto no es un modelo y no debe emplearse como tal en ningún sistema de generación, clasificación ni recuperación.
- Auditoría de seguridad: un equipo puede usar esta ficha como referencia para identificar repositorios de Hugging Face que suplantan el formato de model card para distribuir ejecutables.
- Documentación de políticas de plataforma: sirve como ejemplo de por qué conviene validar que un repositorio contiene pesos y configuración de modelo antes de aprobar su descarga en entornos corporativos.
- Formación interna: caso práctico para explicar a desarrolladores los indicios de un paquete no deseado (contraseña de archivo, enlaces a releases de GitHub ajenos al autor declarado, insignias de descargas infladas).
- Filtrado en proxies y gateways: la URL y el hash del paquete pueden añadirse a listas de bloqueo de artefactos en mirrors internos de Hugging Face.
- Monitorización de la cadena de suministro: permite ejemplificar la diferencia entre un artefacto firmado y verificado y un ZIP con contraseña sin trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de modelos, porque el artefacto no es un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 (22H2) y Windows 11 (24H2), arquitectura x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto es un `.exe` que se ejecuta con privilegios de administrador.
- Huella declarada por el autor: menos de 44 MB de RAM y respuesta inferior a 25 ms en los módulos descritos, cifras no verificables de forma independiente.
- Latencia y throughput de modelo: no disponible.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el repositorio no contiene un modelo de IA. Frente a modelos reales de la plataforma (por ejemplo, cualquier LLM con pesos en safetensors y licencia declarada), este artefacto carece de parámetros, contexto, benchmarks y formato de pesos, por lo que una comparación técnica sería inválida.

## Limitaciones y advertencias

- No es un modelo de IA: la ficha reutiliza el esquema de model card para distribuir un ejecutable de Windows.
- Riesgo de seguridad elevado: el ZIP requiere contraseña (`2026`), el binario se ejecuta como administrador y el README indica explícitamente que puede generar alertas de Windows Defender o SmartScreen. Estos son patrones habituales en la distribución de software no deseado.
- Enlaces de descarga apuntan a repositorios de GitHub de terceros (`ekaterina96522`, `yperez230`) distintos del autor declarado en Hugging Face (`parth2907`), lo que rompe la trazabilidad de la cadena de suministro.
- Las insignias de descargas (925K+) y valoración (5.0/5) no son verificables y contradicen el contador real de la plataforma (0 descargas, 0 likes).
- Uso comercial: la licencia MIT se declara en los metadatos, pero se aplica a un artefacto sin código fuente disponible ni pesos; no cubre el uso de trampas en juegos, que puede violar los términos de servicio de las plataformas afectadas.
- Riesgo legal y de cumplimiento: la manipulación de memoria de otros procesos y la evasión de captura pueden contravenir legislación de ciberseguridad en varias jurisdicciones.
- Sesgos y alucinación: no aplica al no ser un modelo generativo; el "sesgo" relevante es el de la propia ficha, que presenta el artefacto como si fuera técnico y evaluable.
- No debe descargarse ni ejecutarse en entornos de producción, investigación o desarrollo sin un análisis previo en sandbox aislado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/parth2907/steam-deck-cheat-trainer
- Release de GitHub citada en la model card: https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card: https://github.com/yperez230/steam-deck-cheat-trainer/releases/latest
