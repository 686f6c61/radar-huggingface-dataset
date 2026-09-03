# Snapkitty/sovereign-emulator

## Resumen

Snapkitty/sovereign-emulator no es un modelo de inteligencia artificial convencional (como un LLM), sino un **emulador de agentes soberanos**: un entorno de ejecución virtual, basado en navegador, donde agentes autónomos pueden proponer acciones sin ejecutarlas unilateralmente, sujetos a una constitución estilo Prolog que decide si una acción es permitida. El proyecto, desarrollado por Snapkitty, busca ser una herramienta de inspección de runtime para sistemas multiagente gobernados, con registro criptográfico de decisiones (cadena WORM SHA-256), navegador web integrado y shell virtual.

Aunque se publica en Hugging Face, no contiene pesos de red neuronal ni arquitectura de modelo; es una aplicación web (JavaScript) que simula un entorno de agentes. Su relevancia radica en proponer un marco de gobernanza para agentes autónomos, con mecanismos de control de riesgos y trazabilidad, en un momento donde la seguridad y la auditoría de sistemas de IA son críticas. No se dispone de información sobre parámetros, contexto o licencia, y el repositorio tiene cero descargas y cero likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo de IA; es un emulador web de agentes) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (interfaz en ingles, segun la model card) |
| Licencia | No disponible |
| Formato de pesos | No aplica (codigo fuente, sin pesos) |

## Arquitectura y entrenamiento

El emulador se compone de cuatro capas: una **capa de agentes** (34 agentes predefinidos con roles, niveles de confianza, dominios y compuertas), un **motor de constitucion** que evalúa propuestas mediante reglas `can_execute/2` (comprueba confianza, dominio, resonancia y riesgo), una **superficie de herramientas** (navegador web, shell virtual, chat y volcado de mundo) y un **registro WORM** (append-only) que sella cada decisión con SHA-256. No hay entrenamiento de modelo; es una aplicación de software pura, sin componentes de aprendizaje automático.

La innovación técnica reside en el modelo de gobernanza: los agentes proponen acciones, pero la ejecución está condicionada a la aprobación de la constitución, y cada veredicto se registra de forma inmutable. Incluye también un shell virtual seguro (no accede al sistema operativo del host) y un navegador con captura de texto mediante proxy CORS para que los agentes puedan leer contenido web.

## Capacidades

- **Proposicion de acciones**: los agentes pueden sugerir comandos, navegaciones o mensajes, pero nunca ejecutarlos sin pasar por el motor constitucional.
- **Constitucion Prolog**: reglas `can_execute/2` que evalúan confianza, dominio, resonancia y riesgo; las acciones de alto riesgo con baja confianza se deniegan (con camino de consejo simulado).
- **Registro WORM**: cadena SHA-256 append-only que sella cada decisión; permite verificar y volcar el ledger.
- **Navegador web integrado**: navegación por iframe y captura de texto mediante proxy CORS para que los agentes lean sitios web.
- **Shell virtual (Bash in/out)**: terminal seguro con comandos como `ls`, `cat`, `status`, `worm`, `browse`, `fetch`, `msg`, entre otros; distingue entre comandos de lectura (bajo riesgo) y escritura (alta confianza requerida).
- **Chat con comandos slash**: `/browse`, `/bash`, `/worm`, `/const`, `/status`, `/help`.
- **Simulacion de llamadas**: función para simular llamadas entrantes (stub).
- **Multiagente**: 34 agentes con identidades y roles (AHMAD, SENTINEL, VAULT, etc.).
- **Offline**: fallback a chat local cuando la API mesh no está disponible.

## Casos de uso

- **Auditoria de decisiones en sistemas multiagente**: el registro WORM permite revisar el historial de acciones y verificar su integridad, útil para cumplimiento normativo o análisis forense.
- **Pruebas de politicas de seguridad**: los desarrolladores pueden experimentar con reglas constitucionales y observar cómo se comportan los agentes ante acciones de riesgo variable antes de desplegar sistemas reales.
- **Simulacion de gobernanza de agentes**: investigación academica sobre mecanismos de control de agentes autonomos, probando diferentes configuraciones de confianza y dominios.
- **Entrenamiento en seguridad de IA**: herramienta educativa para demostrar conceptos de restriccion de acciones y trazabilidad en entornos controlados.
- **Prototipado de agentes con navegacion web**: los agentes pueden explorar sitios web (via proxy CORS) y proponer acciones basadas en el contenido, sirviendo como banco de pruebas para agentes de scraping o investigacion.
- **Demostracion de shell seguro**: el terminal virtual permite experimentar con comandos sin riesgo para el host, ideal para talleres sobre entornos sandbox.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no existen metricas de MMLU, HumanEval, etc. El rendimiento del emulador depende del navegador del cliente y no se han proporcionado datos de latencia o throughput.

## Requisitos de hardware

- **Ninguno especifico**: al ser una aplicacion web pura, se ejecuta en cualquier navegador moderno (Chrome, Firefox, Safari, Edge) sin instalacion.
- **Memoria**: no se especifica, pero al ser una aplicacion JavaScript, se recomienda al menos 2 GB de RAM en el dispositivo para una experiencia fluida.
- **GPU**: no requerida; todo el procesamiento es CPU y navegador.
- **Despliegue**: se accede via URL (el enlace live proporcionado) o se puede servir el codigo fuente estaticamente (GitHub Pages, Netlify, etc.).
- **Latencia**: no disponible; depende del rendimiento del navegador y la red.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros emuladores de agentes o modelos de IA en la informacion proporcionada. El proyecto es unico en su enfoque de gobernanza constitucional, pero no hay datos para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- **No es un modelo de IA**: no genera texto ni razonamiento; los agentes son simulados con logica predefinida, no con aprendizaje automatico.
- **Sin licencia clara**: la model card no especifica licencia, lo que impide su uso comercial legal sin consultar al autor.
- **Sin soporte de idiomas declarado**: la interfaz parece estar en ingles, sin confirmacion de soporte multilingue.
- **Cero adopcion**: el repositorio tiene 0 descargas y 0 likes, lo que sugiere una falta de validacion por parte de la comunidad.
- **Funcionalidad limitada**: el shell y el navegador son simulados; no acceden al sistema real, por lo que no sirven para tareas de produccion.
- **Fecha futura**: la fecha de creacion (2026-09-03) es posterior a la fecha actual (2025), lo que podria indicar un error en los metadatos o un proyecto ficticio.
- **Riesgo de alucinacion**: no aplica, pero en el contexto de agentes, las decisiones pueden ser impredecibles si las reglas constitucionales no estan bien definidas.
- **Requiere confianza en el codigo**: al no haber una auditoria externa, el uso en entornos sensibles no es recomendable.

## Enlaces

- [HuggingFace - Snapkitty/sovereign-emulator](https://huggingface.co/Snapkitty/sovereign-emulator)
- [Sitio live del emulador](https://snapkittywest.github.io/sovereign-emulator/)
