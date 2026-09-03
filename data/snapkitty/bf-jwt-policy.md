# Snapkitty/bf-jwt-policy

## Resumen

El repositorio `Snapkitty/bf-jwt-policy` no contiene un modelo de inteligencia artificial, sino un sistema de autorización basado en políticas expresadas como programas Brainfuck y verificadas formalmente con SPARK/Ada. Fue desarrollado por Ahmad Ali Parr y Jessica L. Williams (SNAPKITTYWEST) como respuesta a un fallo de seguridad en un esquema anterior denominado BF256, que utilizaba Brainfuck como primitiva criptográfica y fue roto mediante álgebra lineal. La nueva arquitectura emplea una máquina virtual Brainfuck (bf_vm) verificada con GNATprove al 100%, que evalúa políticas de autorización JWT de forma determinista, segura y sin fugas de información. El proyecto incluye un puente FFI en Rust para integrarse en aplicaciones modernas. Aunque no es un modelo de IA, su diseño formal y su enfoque en seguridad lo hacen relevante para desarrolladores que buscan motores de políticas auditables y de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Máquina virtual Brainfuck (Turing-completa) con verificación formal SPARK/Ada |
| Parametros totales | No aplica (no es un modelo neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica (lenguaje de programación Brainfuck) |
| Licencia | Tri-licencia: AGPL-3.0 \| BSL 1.1 → MIT \| MIT |
| Formato de pesos | No aplica (código fuente Ada, Rust y Brainfuck) |

## Arquitectura y entrenamiento

No es un modelo entrenado. La arquitectura consiste en una máquina virtual Brainfuck (bf_vm) escrita en Ada y verificada con SPARK/Ada mediante GNATprove. El sistema se compone de tres capas: la firma JWT estándar (HS256/ES256) protege la autenticidad del token, luego la VM Brainfuck interpreta un programa que actúa como política de autorización, y finalmente GNATprove garantiza propiedades de seguridad como terminación, determinismo, seguridad de memoria y no interferencia entre entradas secretas y salidas públicas. El proyecto incluye un puente FFI en Rust (bf_jwt_policy) para su integración en aplicaciones. No hay fase de entrenamiento ni datos de entrenamiento.

## Capacidades

- Evaluación de políticas de autorización mediante programas Brainfuck deterministas y formalmente verificados.
- Verificación formal con GNATprove: 100% de pruebas superadas, 0 fallos, 0 sin probar.
- Propiedades garantizadas: seguridad de memoria, terminación, determinismo y no interferencia de datos secretos.
- Integración con JWT mediante firmas estándar HS256/ES256.
- Puente FFI en Rust para uso desde aplicaciones modernas.
- Soporte de contextos de política estructurados (ej. `PolicyContext { role: Admin, ... }`).
- No incluye capacidades de generación de texto, visión, audio ni razonamiento de IA.

## Casos de uso

- Autorización de APIs con políticas auditables: el sistema evalúa una política Brainfuck contra el contexto del JWT, permitiendo o denegando acceso de forma determinista. Adecuado para entornos donde se requiere una auditoría formal de la lógica de autorización.
- Sistemas de control de acceso basados en roles (RBAC): se puede codificar una política que verifique el rol del usuario (Admin, User, etc.) y decida si puede ejecutar una acción concreta.
- Sustitución de motores de políticas como OPA en entornos de alta seguridad: al estar verificado formalmente, ofrece garantías matemáticas de que no hay fugas de información ni comportamientos no deseados.
- Integración en microservicios mediante el puente Rust: el crate `bf_jwt_policy` permite incrustar la VM en servicios escritos en Rust, con compilación de Ada vía FFI.
- Educación e investigación sobre verificación formal aplicada a sistemas de autorización: el código SPARK y los resultados de GNATprove sirven como ejemplo de cómo demostrar propiedades de seguridad en un intérprete.
- Herramienta de hardening para pipelines de CI/CD: se pueden generar políticas Brainfuck a partir de reglas de negocio y verificar su comportamiento antes del despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de rendimiento, latencia ni throughput. Al ser una VM Brainfuck simple, se espera un consumo mínimo de recursos, pero no se proporcionan mediciones.

## Requisitos de hardware

- No se especifican requisitos concretos. Al ser una máquina virtual minimalista, los requisitos son despreciables en cualquier hardware moderno.
- Se requiere un compilador Ada (GNAT) y GNATprove para la verificación, así como Rust y Cargo para construir el puente FFI.
- El despliegue en producción solo necesita el binario resultante (Rust + Ada estático), sin dependencias externas.
- No aplica GPU ni aceleración por hardware.
- La VM utiliza una cinta de memoria típicamente inferior a 100 celdas, por lo que el uso de RAM es mínimo.

## Comparativa con modelos similares

No disponible. Este proyecto no es comparable con modelos de IA, sino con motores de políticas como Open Policy Agent (OPA) o Cedar, pero no se dispone de datos de comparación en la información proporcionada. La principal diferencia es la verificación formal: mientras OPA usa Rego y no ofrece pruebas matemáticas de seguridad, este sistema garantiza propiedades mediante SPARK.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona ni procesa lenguaje natural.
- La lógica de autorización debe expresarse en Brainfuck, un lenguaje esotérico de muy baja legibilidad, lo que dificulta el mantenimiento.
- La verificación formal se limita a la VM, no a la política en sí. La corrección de la política depende del programador.
- La tri-licencia (AGPL-3.0, BSL 1.1 y MIT) requiere revisión legal para uso comercial, ya que la BSL 1.1 impone restricciones hasta su conversión a MIT (fecha no especificada).
- No hay documentación sobre el formato exacto de las políticas Brainfuck ni ejemplos más allá del demo.
- El proyecto parece estar en una fase temprana (creado en 2026-09-03, sin descargas ni likes), por lo que puede contener errores no detectados.
- La seguridad de las firmas JWT depende del estándar HS256/ES256; la VM no añade protección criptográfica adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Snapkitty/bf-jwt-policy
- No se proporcionan enlaces adicionales (papers, blogs, repos externos) en la información disponible.
