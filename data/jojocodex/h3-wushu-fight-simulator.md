# Jojocodex/H3-Wushu-Fight-Simulator

## Resumen

H3-Wushu-Fight-Simulator (H3 武斗模拟器, v9.25) no es un modelo de pesos, sino un **programa de escritorio para Windows** publicado en HuggingFace que simula combates de wushu de forma determinista y, a partir del resultado, genera **prompts para el sistema de generación de vídeo MiniMax H3**. Lo desarrolla el usuario Jojocodex y el repositorio contiene un ejecutable único (.NET 8 + WebView2), documentación y manuales de reglas de ingeniería de prompts, con un total de 3,3 GB de repositorio.

El problema que aborda es la pérdida de coherencia espacial y narrativa en prompts de vídeo de artes marciales: el programa ejecuta primero una **resolución de combate 3D a 60 Hz** (quién golpea, con qué técnica, si hay impacto o bloqueo, retroceso o altura sobre el suelo) y exporta ese resultado como material estructurado (tabla de posiciones por compás, formas nombradas de cada técnica, escalado de efectos) que se entrega al modelo de lenguaje para redactar el prompt final.

Es relevante para quienes trabajan en generación de vídeo con prompts y en tooling de prompt engineering, porque separa el cálculo físico de la redacción y añade una capa de validación por reglas. La interfaz, la documentación y los prompts están en chino (tag `zh`); el repositorio no declara licencia y no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: el repositorio no contiene una red neuronal. Es una aplicación de escritorio (.NET 8 de archivo único + WebView2) con motor de simulación de combate 3D determinista a 60 Hz y motor de reglas para generación de prompts |
| Parametros totales | No disponible (no se distribuyen pesos propios) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo H3 y del LLM que el usuario configure con su propia clave de API) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (`zh`) en metadatos, interfaz y documentación. No se documenta soporte de otros idiomas |
| Licencia | No disponible (no declarada en la model card ni en los metadatos del repositorio) |
| Formato de pesos | No aplica: el repo contiene `.exe`, `.zip`, `.md` y `.txt`. Los pesos opcionales de LAYA se descargan aparte bajo demanda |
| Version | v9.25 |
| Tamano del repositorio | 3,3 GB |
| Plataforma | Windows 10/11 x64; requiere .NET 8 y WebView2 (sin Node.js ni Python) |
| Artefactos principales | `H3武斗模拟器.exe` (69,7 MB); portable `.zip` (65 MB); completo con runtime LAYA (244 MB) |
| Modelos externos opcionales | LAYA (juez, puntuación de prompts y planificación de cámara), ~2,4 GB, descargado desde `convaiinnovations/laya` |
| Fechas del repositorio | Creado 2026-09-25; actualizado 2026-09-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay datos de entrenamiento: el repositorio no publica un modelo entrenado, ni número de tokens, ni composición de dataset, ni fases de RLHF/DPO. El componente técnico verificable es un **kernel de simulación de combate**: resolución determinista 1 contra 1 a 60 Hz, con cálculo de iniciativa, elección de técnica, impacto o bloqueo, retroceso y altura sobre el suelo. Los combates de uno contra varios se resuelven con un modo de resolución de grupo distinto, y la previsualización 3D en tiempo real solo admite 1v1.

Sobre ese resultado se aplica un **motor de reglas** que produce material auxiliar: tabla de posiciones por compás, formas nombradas de las técnicas, clasificación de efectos y frases de continuidad entre planos. La capa generativa es externa: el programa llama a una API compatible con OpenAI usando la clave del propio usuario para el relleno de fichas de personaje y para la reescritura de prompts según las indicaciones del juez LAYA. Sin clave, las funciones locales (simulación, previsualización 3D, material y esqueleto de prompt, verificación por reglas) siguen operativas.

Como innovaciones declaradas por el autor destacan: 7 estilos de combate (automático, choque cuerpo a cuerpo, magia predominante, cuerpo a cuerpo enlazado con magia, combate aéreo, golpear y retirarse y duelo de inmortales y deidades), 16 perfiles de repertorio de personaje (por ejemplo Yang Guo, Hong Qigong o Sun Wukong), y una biblioteca de **116 efectos con nombre propio** en 10 categorías, cada uno especificado según la nomenclatura oficial 形·色·量·光·破·影 (forma, color, cantidad, luz, rotura, sombra), con cinco tiempos, segundos de carga, capas de sonido y rastro residual. Para niveles de fuerza 8-9 el estilo por defecto es "duelo de inmortales y deidades", con al menos un 70 % de compases relacionados con hechizos y cargas de 2 a 4 segundos; durante una carga larga, el primer impacto recibido se absorbe mediante "protección de lanzamiento" sin interrumpir el hechizo.

## Capacidades

- Simulación determinista de combate 3D a 60 Hz para 1v1, con resultado exportable (técnica, impacto, bloqueo, retroceso, altura).
- Resolución de combates de uno contra varios mediante modo de resolución de grupo (sin previsualización 3D en tiempo real).
- Generación de prompts formateados para MiniMax H3 a partir del resultado de la simulación, el estilo de combate y el repertorio del personaje.
- Previsualización 3D en tiempo real de la escena simulada, con personajes humanoides básicos distinguidos por color de equipo; es una previsualización programática, no vídeo generado.
- Verificación de prompts por reglas locales: detecta teleportaciones, cambios de personaje y desapariciones, y comprueba la continuidad entre planos.
- Sistema de puntuación y crítica mediante LAYA local (juez, planificación de cámara y control general), con reescritura posterior del prompt.
- Biblioteca consultable de 116 efectos con nombre, con panel de categorías, búsqueda, copia y exportación a Markdown.
- Escalado de efectos en 9 niveles según nivel de fuerza y estilo, con requisitos de tamaño (en metros) y de rastro residual.
- Relleno automático de fichas de personaje y reglas a partir de una descripción de una frase (requiere clave de API).
- No se documenta soporte de tool calling, de function calling ni de razonamiento multi-paso por parte del propio programa.

## Casos de uso

- Preproducción de vídeo de artes marciales: el programa produce el prompt completo de una escena de pelea con posiciones por compás, formas de técnica y efectos escalados, de modo que el creador no tiene que describir la coreografía desde cero.
- Coherencia de continuidad en secuencias largas: la tabla de posiciones por compás y las frases de continuidad entre planos permiten que varios planos generados por separado mantengan la misma ubicación y distancia entre personajes.
- Generación de peleas con magia o temática de inmortales: el estilo "duelo de inmortales y deidades" fuerza un mínimo del 70 % de compases con hechizos, cargas de 2 a 4 segundos y efectos de escala sobrenatural, lo que resulta adecuado para escenas de xianxia.
- Reutilización de repertorios de personaje: aplicar un perfil de repertorio (por ejemplo, técnicas de bastón con clones o transformaciones) garantiza que un mismo personaje se comporte de forma consistente entre episodios.
- Control de calidad de prompts antes de gastar presupuesto de generación: el verificador local y el juez LAYA permiten detectar y corregir saltos de posición o cambios de personaje antes de enviar el prompt al sistema de vídeo.
- Creación de catálogos personales de efectos: la biblioteca de 116 efectos y su exportación a Markdown sirven como referencia interna de un equipo para homogeneizar la descripción de efectos visuales.
- Formación y consulta técnica: el manual de reglas (`wushu-fight-rules-V3.2-optimizado.md`) puede usarse como material de lectura sobre ingeniería de prompts para vídeo, independientemente del ejecutable.
- Prototipado de coreografías sin GPU: al no necesitar aceleración por hardware para la simulación ni la previsualización, se puede trabajar en equipos de oficina sin tarjeta gráfica dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas con otros modelos o herramientas, ni métricas de calidad de los prompts generados. El único dato de validación aportado por el autor es que el ejecutable incorpora una autocomprobación interna de más de 200 aserciones (`H3武斗模拟器.exe --selftest`), que debe devolver `status=PASS` antes de empaquetar cada versión.

## Requisitos de hardware

- GPU: no se requiere para el programa principal; la simulación y la previsualización 3D funcionan sin aceleración dedicada según la documentación del autor.
- VRAM estimada: no disponible. No se documentan requisitos de VRAM ni para LAYA ni para la previsualización.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: el programa es ejecutable en CPU; no se especifica ninguna GPU concreta.
- Sistema operativo: Windows 10/11 x64, con .NET 8 (archivo único) y WebView2 (normalmente presente; en caso contrario, se instala el runtime Evergreen de Microsoft).
- Dependencias: no requiere Node.js ni Python. La conexión de red solo se usa para el pulido por IA y para la descarga opcional de los pesos de LAYA.
- Almacenamiento: 69,7 MB para el ejecutable; 65 MB la versión portable; 244 MB la versión completa; hasta 2,4 GB adicionales si se habilitan los pesos de LAYA. El repositorio completo ocupa 3,3 GB.
- Despliegue: aplicación de escritorio (doble clic). No es compatible con vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles. Se indica que el primer arranque descomprime la interfaz en `%LOCALAPPDATA%\H3WushuSim\` y tarda algo más de diez segundos; la simulación se ejecuta internamente a 60 Hz.
- Configuración y autocomprobación: los ajustes, las plantillas y los registros residen en `%LOCALAPPDATA%\H3WushuSim\`; borrar esa carpeta restablece el estado de fábrica. Existe comprobación de integridad mediante `SHA256.txt`.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se identifican herramientas comparables con datos verificables de parámetros, contexto, rendimiento o licencia. Las alternativas funcionales serían la redacción manual de prompts para MiniMax H3 o el uso directo de la interfaz oficial del sistema de vídeo, pero no se aportan datos cuantitativos de ninguna de ellas. Tampoco se puede comparar con modelos de lenguaje o de vídeo, porque este repositorio no distribuye un modelo entrenado.

## Limitaciones y advertencias

- No es un modelo de IA: no genera vídeo ni pesos; su salida es un prompt de texto y material auxiliar. Cualquier expectativa de generación directa de vídeo es incorrecta.
- La previsualización 3D son personajes humanoides básicos diferenciados por color, descritos por el autor como previsualización programática de posición, ritmo y técnica; no es vídeo fotorrealista.
- Restricción de escala: la vista 3D en tiempo real solo cubre 1v1; los combates de uno contra varios se resuelven con un modo de grupo sin esa previsualización.
- Dependencia de clave externa: las funciones de IA (relleno de fichas y reescritura según las indicaciones de LAYA) necesitan una clave de API compatible con OpenAI. Sin clave, esas capacidades no están disponibles.
- Dependencia de terceros: el formato de los prompts está atado a MiniMax H3. Un cambio en la sintaxis o en los requisitos de la plataforma puede invalidar los prompts generados.
- Idioma: interfaz, documentación y preajustes están en chino; no se documenta soporte de otros idiomas para la interfaz ni para la salida.
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita para uso comercial, redistribución o modificación. Es un riesgo legal que debe resolverse con el autor antes de un despliegue en producción.
- Componente externo con licencia propia: los pesos opcionales de LAYA (~2,4 GB) proceden del repositorio `convaiinnovations/laya` y se rigen por sus propios términos, no verificados aquí.
- Ausencia de validación comunitaria: 0 descargas y 0 valoraciones en el momento de los datos; no hay evidencia externa de funcionamiento en entornos distintos del del autor.
- Distribución de binarios: se trata de un ejecutable de Windows de un autor sin historial público verificable. Conviene comprobar el hash SHA256 publicado en el repositorio y ejecutarlo en un entorno aislado antes de usarlo en una máquina de producción.
- Riesgo de alucinación: no aplica al núcleo de simulación, que es determinista, pero sí a la capa de IA externa, que redacta y reescribe texto y puede introducir detalles no presentes en el resultado simulado.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluación de sesgos.
- Límites de contexto e idioma: no disponible, al depender del LLM externo configurado por el usuario y del modelo H3 objetivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jojocodex/H3-Wushu-Fight-Simulator
- Repositorio de pesos opcionales de LAYA (juez local): https://huggingface.co/convaiinnovations/laya
- Espejo de descarga alternativo citado en la documentación: https://hf-mirror.com
- Archivo de verificación de integridad: `SHA256.txt` dentro del repositorio
- Manual de reglas de prompts: `h3-skill/wushu-fight-rules-V3.2-优化版.md` y `.txt`
- Biblioteca de efectos: `h3-skill/fx-library-V1.md`, `.txt` y `-en.txt`
- Documentación incluida: `H3武斗模拟器_使用指南.md`, `README-优化版.md`, `上下文日志.md`, `快速开始.txt`
- Papers, blogs y demos: no disponible en la información proporcionada.
