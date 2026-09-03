# Snapkitty/ortho32-sdk-java

## Resumen

El repositorio `Snapkitty/ortho32-sdk-java` no contiene un modelo de inteligencia artificial, sino un kit de desarrollo de software (SDK) en Java para ORTHO-32, una arquitectura de hardware de propósito específico (ISA de 32 bits con unidad tensorial TMUL de 4 ciclos, trazado determinista y verificación formal mediante teoremas mecánicamente comprobados en Lean4 y HOL Light). El SDK proporciona una capa de abstracción estable y tipada para que aplicaciones JVM interactúen con dispositivos ORTHO-32 a través de transporte simulado (sin hardware), PCIe, USB, Ethernet o un puente nativo. Fue publicado por el usuario Snapkitty en septiembre de 2026, aunque no se indica autoría corporativa ni licencia.

El proyecto resuelve el problema de desarrollar software para un hardware especializado sin exponer detalles de bajo nivel (registros PCIe, DMA, MMIO). Ofrece APIs Java inmutables, operaciones asíncronas con `CompletableFuture`, streaming con `Flow.Publisher`, y un transportador simulador determinista para pruebas y CI. Su relevancia actual radica en que permite evaluar y desarrollar contra una arquitectura de hardware emergente sin necesidad de disponer del dispositivo físico, y su diseño orientado a contratos estables facilita la portabilidad entre diferentes implementaciones de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SDK de Java para hardware ORTHO-32 (ISA de 32 bits, unidad tensorial TMUL de 4 ciclos, trazado determinista H=0) |
| Parametros totales | no disponible (no es un modelo de IA) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un SDK) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (el SDK está en Java, sin datos sobre localización) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos; el artefacto es código Java y JARs) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un SDK de software. La arquitectura subyacente de ORTHO-32 incluye una ISA de 32 bits con arbitraje determinista, una unidad de multiplicación de tensores (TMUL) de 4 ciclos, trazado ciclo a ciclo con determinismo H=0, y 12 teoremas verificados formalmente (Lean4 + HOL Light). Los comandos de fabric se direccionan lógicamente, se ordenan por época y se completan con marcas de tiempo de ciclo arquitectónico, no de tiempo de pared.

El SDK implementa una capa de transporte abstracta (`OrthoTransport`) con implementaciones para simulador, PCIe, USB, Ethernet y puente nativo. No existe un proceso de entrenamiento con datos; el desarrollo se centra en la construcción de APIs Java estables, pruebas con el simulador y verificación de compatibilidad entre versiones de SDK, protocolo de fabric y ABI de dispositivo.

## Capacidades

- Proporciona APIs Java tipadas y estables para interactuar con dispositivos ORTHO-32: `OrthoRuntime`, `OrthoSession`, `OrthoDevice`, `FabricCommand`, `TensorJob`, `ExecutionTrace`, `TheoremResult`.
- Soporta operaciones tensoriales (TMUL) y cómputo escalar a través de módulos `ortho-tensor` y `ortho-compute`.
- Ofrece trazado de ejecución ciclo a ciclo con `ExecutionTrace` y `TraceHash`, permitiendo reproducibilidad y comparación de trazas.
- Incluye verificación formal integrada: `TheoremId`, `TheoremResult`, `VerificationStatus` y `CrossVerificationResult` para comprobar teoremas mecánicamente.
- Implementa seguridad por capacidades: `Capability`, `Permission`, `SecurityContext` y `Attestation`.
- Proporciona un simulador determinista (`SimulatorTransport`) que permite desarrollo offline, pruebas unitarias y CI sin hardware.
- Soporta transporte intercambiable: PCIe, USB, Ethernet y puente nativo JNI, manteniendo la misma API de aplicación.
- Incluye JSON Schemas para `FabricCommand`, `FabricCompletion`, `ExecutionTrace`, `TheoremResult` y `Attestation`, facilitando interoperabilidad y validación.
- Ofrece integración con Gradle y Maven, con builds reproducibles, checksums y dependency locking.
- Requiere Java 21 y Gradle 8.x.

## Casos de uso

- **Desarrollo de aplicaciones JVM para hardware ORTHO-32**: los desarrolladores pueden escribir código Java contra las APIs estables del SDK y desplegarlo posteriormente en dispositivos físicos sin cambiar la lógica de aplicación.
- **Pruebas y CI sin hardware**: gracias al `SimulatorTransport`, los equipos pueden ejecutar pruebas unitarias e integración en entornos de integración continua sin necesidad de disponer de un dispositivo ORTHO-32 físico, garantizando determinismo en los resultados.
- **Evaluación de la arquitectura ORTHO-32**: investigadores y arquitectos de hardware pueden simular el comportamiento del fabric y medir ciclos de ejecución, trazas y latencias antes de fabricar o adquirir hardware real.
- **Integración con sistemas de verificación formal**: el módulo `ortho-verify` permite validar teoremas y resultados de verificación, útil en entornos donde se requiere garantía matemática de corrección (por ejemplo, sistemas críticos o certificaciones).
- **Desarrollo de agentes autónomos**: el módulo `ortho-agent` expone `AgentIntent`, `AgentTask`, `AgentResult` y `AgentCapability`, permitiendo construir agentes que interactúan con el fabric ORTHO-32 de forma controlada.
- **Migración entre transportes**: una aplicación desarrollada contra el simulador puede pasar a producción cambiando únicamente el transporte (PCIe, USB, Ethernet) sin modificar el código de aplicación, lo que facilita prototipado rápido y despliegue incremental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye datos de rendimiento comparativos, latencias medias ni throughput. La única métrica mencionada es el número de ciclos arquitectónicos en los resultados de `TensorResult` y `ExecutionTrace`, pero no hay valores de referencia.

## Requisitos de hardware

- **Software**: Java 21 (toolchain), Gradle 8.x.
- **Hardware para desarrollo**: no se requiere hardware ORTHO-32; el simulador funciona en cualquier máquina con JVM.
- **Hardware para producción**: se requiere un dispositivo ORTHO-32 accesible por PCIe, USB, Ethernet o mediante un host service nativo (JNI). No se especifican requisitos de VRAM, GPU o memoria.
- **Opciones de despliegue**: el SDK se integra en aplicaciones JVM mediante Gradle o Maven. No se mencionan servidores de inferencia como vLLM u Ollama, ya que no es un modelo de IA.
- **Latencia y throughput**: no disponibles; el SDK expone ciclos arquitectónicos en las trazas, pero no hay datos de rendimiento medidos.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA y no existen modelos comparables en la misma categoría. Si se interpreta como SDK de hardware, no hay alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo de IA**: el repositorio contiene un SDK de Java para hardware, no un modelo de lenguaje, visión u otro tipo de IA. No debe confundirse con un modelo generativo.
- **Dependencia de hardware específico**: las funcionalidades de producción requieren un dispositivo ORTHO-32; sin hardware real, solo el simulador está disponible.
- **Licencia no especificada**: la ausencia de licencia puede impedir su uso comercial o distribución sin autorización explícita del autor.
- **Idiomas y localización**: no se indica soporte multilingüe; el SDK está en inglés (nombres de clases, documentación).
- **Madurez**: la versión indicada es `0.1.0`, lo que sugiere una fase temprana de desarrollo; las APIs pueden cambiar en futuras versiones.
- **Compatibilidad**: el SDK requiere Java 21 y Gradle 8.x; entornos con versiones anteriores no son compatibles.
- **Riesgo de alucinación**: no aplica, al no ser un modelo generativo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/ortho32-sdk-java
- Repositorio de código (mencionado en el README): https://github.com/ortho32/ortho32-sdk-java.git
